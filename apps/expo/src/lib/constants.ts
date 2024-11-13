const devConstants = {
  supabaseUrl: "https://zmvdimcemmhesgabixlf.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdmRpbWNlbW1oZXNnYWJpeGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEyMzc3OTcsImV4cCI6MjAzNjgxMzc5N30.tggm1XC8TS_ZkMrVIWhD_y4SEi8i7rpBUv1CjjLwWQU",
  servicegeekUrl: "https://www.servicegeek.app",
  serviceRoleJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdmRpbWNlbW1oZXNnYWJpeGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEyMzc3OTcsImV4cCI6MjAzNjgxMzc5N30.tggm1XC8TS_ZkMrVIWhD_y4SEi8i7rpBUv1CjjLwWQU",
};

const productionConstants = {
  supabaseUrl: "https://zmvdimcemmhesgabixlf.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdmRpbWNlbW1oZXNnYWJpeGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEyMzc3OTcsImV4cCI6MjAzNjgxMzc5N30.tggm1XC8TS_ZkMrVIWhD_y4SEi8i7rpBUv1CjjLwWQU",
  servicegeekUrl: "https://www.servicegeek.app",
  serviceRoleJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdmRpbWNlbW1oZXNnYWJpeGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEyMzc3OTcsImV4cCI6MjAzNjgxMzc5N30.tggm1XC8TS_ZkMrVIWhD_y4SEi8i7rpBUv1CjjLwWQU",
};

export const getConstants = () => {
  if (process.env.NODE_ENV === "development") return devConstants;
  return productionConstants;
};
