export const getDashboardPath = (role) => {
  if (role === "recruiter") return "/recruiter/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/candidate/dashboard";
};