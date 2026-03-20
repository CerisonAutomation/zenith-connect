import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.cerision.zenithconnect',
  appName: 'Zenith Connect',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // For local dev: point to your dev server
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0f0a1a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
}

export default config
