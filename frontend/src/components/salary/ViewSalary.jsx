import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table } from "../common/Table";
import { useAuth } from "../../context/authContext";
import { observer } from "mobx-react-lite";
import PageLayout from "../layout/PageLayout";
import { salaryStore } from "../../stores/salary.store";
import { SALARY_HEADER } from "../constants/Constants";
import { Download } from "lucide-react";
import SalarySlip from "../salaryPaySlip/salaryPaySlip";
import html2canvas from "html2canvas";
const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const salarySlipFileName = (item) => {
  const employeeId = toSlug(item.employeeId?.employeeId) || "employee";
  const name = toSlug(item.employeeId?.userId?.name);
  const month = item.payDate
    ? new Date(item.payDate).toISOString().slice(0, 7)
    : "";

  return [employeeId, name, month].filter(Boolean).join("-") + ".png";
};

const ViewSalary = observer(() => {
  const { id, payDate } = useParams();
  const { user } = useAuth();

  const { salaries, loading, salariesByPayDate, fetchSalariesByPayDate, fetchSalaries } = salaryStore;

   useEffect(() => {
    if (payDate) {
      fetchSalariesByPayDate(payDate);
    } else if (id) {
      fetchSalaries(id);
    }
  }, [id, payDate]);

   const salaryData = payDate ? salariesByPayDate : salaries;

  const handleDownload = async (item) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "-1";
    document.body.appendChild(container);

    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);
    root.render(<SalarySlip data={item} />);

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            })
      )
    );

    const slip = container.querySelector("#salary-slip") || container;
    const canvas = await html2canvas(slip, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#F6F3ED",
      onclone: (_doc, cloned) => {
        const bar = cloned.querySelector("#net-pay-bar");
        if (!bar) return;
        bar.style.height = "auto";
        bar.style.paddingTop = "12px";
        bar.style.paddingBottom = "28px";
        bar.style.paddingLeft = "28px";
        bar.style.paddingRight = "28px";
        bar.style.boxSizing = "border-box";
        const logo = cloned.querySelector("#salary-slip img");
        if (logo) {
          logo.style.transform = "translateY(8px)";
        }
      },
    });

    const link = document.createElement("a");
    link.download = salarySlipFileName(item);
    link.href = canvas.toDataURL("image/png");
    link.click();

    root.unmount();
    document.body.removeChild(container);
  };


  return (
    <PageLayout
      title={
        payDate
          ? "Salary by Pay Date"
          : user.role === "employee"
          ? "My Salary"
          : "Employee Salary"
      }
    >
      <Table
        headings={SALARY_HEADER}
        data={salaryData}
        isLoading={loading}
        isSerialNo={true}
        renderRow={(item) => (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {item.employeeId.employeeId}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {item?.employeeId?.userId?.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {item.basicSalary}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {item.revenueTotal}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {item.deductionTotal}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {item.netSalary}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {new Date(item.payDate).toLocaleDateString()}
            </td>
            <td className="px-14 py-6 whitespace-nowrap text-green-600 hover:text-green-700 cursor-pointer" onClick={() => handleDownload(item)}>
              <Download size={20}/>
            </td>
          </>
        )}
      />
    </PageLayout>
  );
});

export default ViewSalary;
