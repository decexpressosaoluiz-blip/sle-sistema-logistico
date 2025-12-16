// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do diretório atual
  // O terceiro argumento '' garante que carregue todas as variáveis, não apenas as com prefixo VITE_
  // Isso é essencial para pegar a API_KEY definida no painel da Vercel
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Base relativa './' é a configuração mais segura para evitar erros de caminho
    base: './', 
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Injeta a variável API_KEY no código compilado
      // O Vite substituirá 'process.env.API_KEY' pelo valor da string durante o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
          overlay: false
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})