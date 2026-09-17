import React from "react";

const formatMMK = (value) =>
  `${Number(value || 0).toLocaleString("en-US")} MMK`;

const MetaCell = ({ label, value, last }) => (
  <div
    className={`flex-1 px-4 py-3.5 ${
      last ? "" : "border-r border-[#C4B5A4]"
    }`}
  >
    <div className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#8A8178]">
      {label}
    </div>
    <div className="text-[13px] font-bold text-[#2C2A28]">{value}</div>
  </div>
);

const AmountRow = ({ label, amount, accent }) => (
  <div
    className={`mb-2.5 flex items-baseline justify-between gap-4 text-[13px] ${
      accent ? "font-bold text-[#B08968]" : "font-medium text-[#2C2A28]"
    }`}
  >
    <span>{label}</span>
    <span className="whitespace-nowrap">{formatMMK(amount)}</span>
  </div>
);

const SalarySlip = ({ data }) => {
  const {
    payDate,
    employeeId,
    basicSalary,
    revenueTotal,
    deductionTotal,
    netSalary,
    kumoCareAllowance,
    overtime,
    homageDeduction,
    yearEndBonus,
    birthdayBonus,
    advanceSalary,
    absentDeduction,
  } = data;

  const name = employeeId?.userId?.name || "-";
  const empId = employeeId?.employeeId || "-";
  const position = employeeId?.designation || "-";
  const monthLabel = payDate
    ? new Date(payDate).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "-";
  const paymentDate = payDate
    ? new Date(payDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "-";

  const earnings = [
    { label: "Basic Salary:", amount: basicSalary, always: true },
    { label: "Kumo Care Allowance:", amount: kumoCareAllowance, always: true },
    { label: "Overtime:", amount: overtime },
    { label: "Birthday Bonus:", amount: birthdayBonus },
    { label: "Year End Bonus:", amount: yearEndBonus },
  ].filter((row) => row.always || Number(row.amount) > 0);

  const deductions = [
    { label: "Advance Salary:", amount: advanceSalary },
    { label: "Paying Homage:", amount: homageDeduction },
    { label: "Absent Deduction:", amount: absentDeduction },
  ].filter((row) => Number(row.amount) > 0);

  return (
    <div
      id="salary-slip"
      className="box-border w-[720px] bg-[#F6F3ED] px-[52px] pb-10 pt-12 font-['Plus_Jakarta_Sans'] text-[#2C2A28]"
    >
      <div className="mb-7 text-center">
        <div className="mb-3.5 flex items-center justify-center gap-3.5">
          <img
            src="/Kumo.svg"
            alt="Kumo Solutions"
            className="block h-20 w-20 translate-y-2 object-contain"
          />
          <div className="flex h-20 items-center text-left text-[30px] font-extrabold leading-none tracking-[0.14em] text-[#2C2A28]">
            KUMO SOLUTIONS
          </div>
        </div>
        <div className="text-[11px] font-semibold tracking-[0.22em] text-[#8A8178]">
          CONFIDENTIAL PAYSLIP • {monthLabel.toUpperCase()}
        </div>
      </div>

      <div className="mb-9 flex bg-[#EFE8DC]">
        <MetaCell label="EMPLOYEE NAME" value={name} />
        <MetaCell label="POSITION" value={position} />
        <MetaCell label="EMPLOYEE ID" value={empId} />
        <MetaCell label="PAYMENT DATE" value={paymentDate} last />
      </div>

      <div className="mb-9 flex gap-12">
        <div className="flex-1">
          <div className="mb-4 text-[13px] font-bold tracking-[0.16em]">
            EARNINGS
          </div>
          {earnings.map((row) => (
            <AmountRow key={row.label} label={row.label} amount={row.amount} />
          ))}
          <div className="mt-2 border-t border-[#C4B5A4] pt-3">
            <AmountRow label="Subtotal:" amount={revenueTotal} accent />
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 text-[13px] font-bold tracking-[0.16em]">
            DEDUCTIONS
          </div>
          {deductions.length > 0 ? (
            deductions.map((row) => (
              <AmountRow
                key={row.label}
                label={row.label}
                amount={row.amount}
              />
            ))
          ) : (
            <div className="mb-2.5 text-[13px] text-[#8A8178]">
              No deductions
            </div>
          )}
          <div className="mt-2 border-t border-[#C4B5A4] pt-3">
            <AmountRow label="Subtotal:" amount={deductionTotal} accent />
          </div>
        </div>
      </div>

      <div
        id="net-pay-bar"
        className="bg-[#2A2724] px-7 pt-3 pb-7 text-[#F6F3ED]"
      >
        <p className="m-0 text-[22px] font-bold leading-none tracking-[0.12em]">
          NET PAY: {formatMMK(netSalary)}
        </p>
        <p className="mt-2 mb-0 text-xs font-medium leading-none text-[#C9C2B8]">
          Paid via Bank Transfer
        </p>
      </div>
    </div>
  );
};

export default SalarySlip;
