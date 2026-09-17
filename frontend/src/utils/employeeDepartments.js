export const employeeDepartments = (emp) => {
  if (!emp) return [];
  if (Array.isArray(emp.departments) && emp.departments.length) {
    return emp.departments;
  }
  if (emp.department) return [emp.department];
  return [];
};

export const departmentLabel = (emp) => {
  const names = employeeDepartments(emp)
    .map((dep) => dep?.dep_name || dep)
    .filter(Boolean);
  return names.length ? names.join(", ") : "-";
};
