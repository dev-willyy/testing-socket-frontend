const switchApiUrl = () => {
  if (import.meta.env.VITE_ENV === 'dev') return import.meta.env.VITE_API_URL_DEV;
  return import.meta.env.VITE_API_URL_PROD;
};

export { switchApiUrl };
