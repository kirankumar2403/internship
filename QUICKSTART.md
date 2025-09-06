# 🚀 Quick Start Guide

Get the Earthquake Visualizer up and running in minutes!

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Modern web browser

## Installation & Setup

```bash
# 1. Navigate to the project directory
cd C:\internship\earthquake-visualizer

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The application will open automatically at `http://localhost:3000`

## First Use

1. **Wait for Data**: The app will load recent earthquake data automatically
2. **Explore the Map**: Click on earthquake markers to see details
3. **Open Sidebar**: Click the filter button (top-left) or press `S`
4. **Try Filters**: Use different time ranges and magnitude filters
5. **View Statistics**: Check the Statistics tab for data analysis
6. **Export Data**: Use the Settings tab to download CSV data

## Key Features to Try

- **Time Ranges**: Switch between Hour, Day, Week, Month views
- **Magnitude Filtering**: Use quick filters for different earthquake categories
- **Map Styles**: Try Satellite, Terrain, or Dark mode
- **Search**: Look for earthquakes by location name
- **Statistics**: Explore charts and notable events
- **Keyboard Shortcuts**: Press `S` for sidebar, `R` to refresh

## Troubleshooting

### Common Issues

**App won't start**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

**Map not loading**
- Check internet connection
- Try refreshing the page
- Clear browser cache

**No earthquake data**
- Verify USGS API is accessible
- Check browser console for errors
- Try a different time range

### Performance Tips

- Use shorter time ranges (Hour/Day) for better performance
- Clear browser cache if map tiles are slow
- Close other browser tabs if memory is limited

## Build for Production

```bash
npm run build
```

## Deploy

### Netlify (Drag & Drop)
1. Run `npm run build`
2. Drag the `build` folder to Netlify

### Vercel
```bash
npm install -g vercel
vercel
```

## Support

- Check the full [README.md](README.md) for detailed documentation
- View inline help tips in the application
- Create GitHub issues for bugs or feature requests

---

**Need Help?** The application includes built-in help tooltips and error messages to guide you through common tasks.
