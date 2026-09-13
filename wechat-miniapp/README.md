# Nomogram Calculator WeChat Mini Program (Test Version)

This project is separate from the web test version at the repository root. All 12 inputs are calculated on the device. It does not use cloud development, a backend API, or external resources.

## Import

1. In WeChat DevTools, choose **Import Project** and select this `wechat-miniapp` directory, not the `pages` subdirectory.
2. Verify that the AppID matches your Mini Program account. If necessary, update it in the project settings.
3. Select **Mini Program** and **Do not use cloud services**, then import the project and click **Compile**.
4. Change a value in the simulator to check that the total updates. Use **Reset to Defaults** to restore the initial values. DevTools can generate a test QR code using **Preview**.

If you already created an empty project in `F:\DB_2`, back it up first. You can copy the contents of this directory into `F:\DB_2`, replace files with the same names, and import `F:\DB_2` again. The original template's `miniprogram` directory is not needed.

This test version keeps the web test's points calculation internally, but displays only the chart-derived **Risk of Breast Cancer** percentage. The supplied nomogram places 60 points at 10% and 272 points at 80%; the displayed values between them use interpolation on the chart's log-odds scale. Outside that plotted range, the app shows `<10%` or `>80%` instead of extrapolating a precise percentage. The result is an estimate from the supplied chart, not a diagnosis or clinical recommendation.
