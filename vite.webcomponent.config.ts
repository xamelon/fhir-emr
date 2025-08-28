import path from 'path';

import { lingui } from '@lingui/vite-plugin';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    'macros',
                    [
                        'babel-plugin-styled-components',
                        {
                            displayName: true,
                            fileName: true,
                            meaninglessFileNames: ['index', 'styles'],
                        },
                    ],
                ],
            },
        }),
        lingui(),
    ],
    define: {
        'process.env.NODE_ENV': '"production"',
        'process.env': '{}',
        global: 'globalThis',
    },
    resolve: {
        alias: [{ find: 'src', replacement: path.resolve(__dirname, './src/') }],
    },
    build: {
        copyPublicDir: true,
        outDir: 'dist/webcomponents',
        cssCodeSplit: false,
        lib: {
            entry: path.resolve(__dirname, 'src/components/BaseQuestionnaireResponseForm/webcomponent.tsx'),
            formats: ["iife"],
            name: 'BaseQuestionnaireResponseFormWebComponent',
            fileName: 'base-questionnaire-response-form-webcomponent',
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
            plugins: [
                {
                    name: 'inline-css',
                    generateBundle(_, bundle) {
                        const cssAssets = Object.keys(bundle).filter(key => key.endsWith('.css'));
                        const jsAssetKey = Object.keys(bundle).find(key => key.endsWith('.js'));
                        
                        if (cssAssets.length > 0 && jsAssetKey) {
                            const cssContent = cssAssets
                                .map(asset => {
                                    const bundleAsset = bundle[asset];
                                    return bundleAsset && 'source' in bundleAsset ? bundleAsset.source : '';
                                })
                                .join('\n');
                            
                            const jsBundle = bundle[jsAssetKey];
                            
                            if (jsBundle && 'code' in jsBundle) {
                                const cssInjection = `(function(){const style=document.createElement('style');style.textContent=\`${cssContent.replace(/`/g, '\\`')}\`;document.head.appendChild(style);})();`;
                                jsBundle.code = cssInjection + jsBundle.code;
                            }
                            
                            cssAssets.forEach(asset => {
                                delete bundle[asset];
                            });
                        }
                    }
                }
            ]
        }
    },
});