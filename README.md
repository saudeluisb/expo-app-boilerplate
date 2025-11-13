# Welcome to jack's Expo React Native free boilerplate 👋

This is an [Expo](https://expo.dev) template project with Superwall libraries ready to use and a simple onboarding sequence for first time users.

This free boilerplate is sponsored by [post bridge](https://post-bridge.com) - a super simple and affordable social media scheduling tool for small teams and founders.

## Get started

1. Clone this repository 

2. Install dependencies

   ```bash
   npm install
   ```
Or 

  ```bash
   npx expo install
   ```

3. Start the app

   ```bash
    npx expo start
   ```
-- you will need to make a development build or run in development mode as Superwall does not work in Expo GO

### Configure Strava integration

Create developer credentials in the [Strava API settings](https://www.strava.com/settings/api) and expose them to the app via
`app.json` or environment variables before launching the editor:

```json
{
  "expo": {
    "extra": {
      "STRAVA_CLIENT_ID": "YOUR_CLIENT_ID",
      "STRAVA_CLIENT_SECRET": "YOUR_CLIENT_SECRET",
      "STRAVA_REDIRECT_URI": "myapp://oauth/strava"
    }
  }
}
```

Alternatively, you can set `EXPO_PUBLIC_STRAVA_CLIENT_ID`, `EXPO_PUBLIC_STRAVA_CLIENT_SECRET`, and
`EXPO_PUBLIC_STRAVA_REDIRECT_URI` in your shell environment.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Need help?

Join [the discord](https://discord.gg/XuT2V5GUkA) for app founders and @jackfriks for help.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
