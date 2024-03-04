const devConstants = {
  supabaseUrl: "https://ajkybybwzavpsehcfpea.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqa3lieWJ3emF2cHNlaGNmcGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjY1NTMzMDYsImV4cCI6MTk4MjEyOTMwNn0.rLiiL8-BNVjwj_0p5q4o4jJ22SSsfaQ-WydOSXICvfI",
  identishotUrl: "https://5788-151-197-20-213.ngrok-free.app",
  serviceRoleJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqa3lieWJ3emF2cHNlaGNmcGVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY2NjU1MzMwNiwiZXhwIjoxOTgyMTI5MzA2fQ.QjkVLUwxWJrMn7A2N14vORrnRvCpE6MXJEjV7igAcLE",
};

const productionConstants = {
  supabaseUrl: "https://assryutwyfriduafbeyu.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc3J5dXR3eWZyaWR1YWZiZXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTY3MTQxOTEsImV4cCI6MTk3MjI5MDE5MX0.jEqjhGQNX8ti2vQApQOGfU7NvOUi_lVsTfbuUtJ-MH8",
  identishotUrl: "https://www.restorationx.app",
  serviceRoleJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc3J5dXR3eWZyaWR1YWZiZXl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY1NjcxNDE5MSwiZXhwIjoxOTcyMjkwMTkxfQ.QMGwQbbWOsZ9btJGixpJHUkBl6pTm4eVj_RpZ8jf2V4",
};

export const getConstants = () => {
  if (process.env.NODE_ENV === "development") return devConstants;
  return productionConstants;
};
