"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { billingRecordsApi } from "@/lib/api";
import type { BillingRecord } from "@/lib/types";
import Swal from "sweetalert2";

export default function BillingRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [record, setRecord] = useState<BillingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentReference, setPaymentReference] = useState("");

  const loadRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await billingRecordsApi.getById(id);
      if (res.ok && res.record) {
        setRecord(res.record);
      } else {
        setError(res.error || "Failed to load billing record");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsPaid = async () => {
    if (!paymentMethod) {
      Swal.fire({
        icon: "error",
        title: "Payment Method Required",
        text: "Please select a payment method",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Mark as Paid?",
      text: "This will update the billing record status to paid.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Mark as Paid",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
    });

    if (!result.isConfirmed) return;

    setProcessing(true);
    try {
      const res = await billingRecordsApi.markAsPaid(id, {
        paymentMethod,
        paymentReference: paymentReference || undefined,
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: res.message || "Billing record marked as paid",
          timer: 2000,
          showConfirmButton: false,
        });
        loadRecord(); // Reload record
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.error || "Failed to mark as paid",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An unexpected error occurred",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <section>
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      </section>
    );
  }

  if (error || !record) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Finance</p>
            <h3>Billing Record Details</h3>
          </div>
          <Link href="/billing-records" className="filter-reset-btn" style={{ textDecoration: "none" }}>
            Back to List
          </Link>
        </div>
        <div style={{
          padding: "40px",
          textAlign: "center",
          background: "#fee",
          color: "#c00",
          borderRadius: "8px"
        }}>
          {error || "Billing record not found"}
        </div>
      </section>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "#10b981";
      case "pending": return "#f59e0b";
      case "overdue": return "#ef4444";
      case "cancelled": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const isPending = record.status === "pending" || record.status === "overdue";

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Finance</p>
          <h3>Billing Record Details</h3>
        </div>
        <Link href="/billing-records" className="filter-reset-btn" style={{ textDecoration: "none" }}>
          Back to List
        </Link>
      </div>

      <div style={{ display: "grid", gap: "24px" }}>
        {/* Status Banner */}
        <div className="panel-card" style={{
          padding: "20px",
          background: getStatusColor(record.status) + "15",
          border: `2px solid ${getStatusColor(record.status)}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: 0, marginBottom: "8px", color: getStatusColor(record.status) }}>
                Status: {record.status.toUpperCase()}
              </h4>
              <p style={{ margin: 0, fontSize: "0.875rem" }}>
                {record.status === "paid" && `Paid on ${formatDate(record.paymentDate!)}`}
                {record.status === "pending" && `Due on ${formatDate(record.dueDate)}`}
                {record.status === "overdue" && `Overdue since ${formatDate(record.dueDate)}`}
                {record.status === "cancelled" && "This billing record has been cancelled"}
              </p>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: getStatusColor(record.status) }}>
              {formatCurrency(record.totalAmount)}
            </div>
          </div>
        </div>

        {/* Enterprise & Period Info */}
        <div className="panel-card" style={{ padding: "24px" }}>
          <h4 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
            Billing Information
          </h4>
          
          <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                Enterprise
              </label>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
                {record.enterpriseName || "Unknown"}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                Package
              </label>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
                {record.packageName}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                Billing Cycle
              </label>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, textTransform: "capitalize" }}>
                {record.billingCycle}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                Billing Period
              </label>
              <p style={{ margin: 0, fontSize: "1rem" }}>
                {formatDate(record.periodStart)} - {formatDate(record.periodEnd)}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                Due Date
              </label>
              <p style={{ margin: 0, fontSize: "1rem", color: record.status === "overdue" ? "#ef4444" : "inherit" }}>
                {formatDate(record.dueDate)}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                Created On
              </label>
              <p style={{ margin: 0, fontSize: "1rem" }}>
                {formatDate(record.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="panel-card" style={{ padding: "24px" }}>
          <h4 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
            Amount Breakdown
          </h4>
          
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Base Amount</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(record.amount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Tax ({record.taxPercentage}% GST)</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(record.taxAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: "#3b82f6", color: "#fff", borderRadius: "6px" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>{formatCurrency(record.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {record.status === "paid" && record.paymentDate && (
          <div className="panel-card" style={{ padding: "24px" }}>
            <h4 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
              Payment Information
            </h4>
            
            <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                  Payment Date
                </label>
                <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
                  {formatDateTime(record.paymentDate)}
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                  Payment Method
                </label>
                <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, textTransform: "capitalize" }}>
                  {record.paymentMethod?.replace(/_/g, " ") || "Not specified"}
                </p>
              </div>

              {record.paymentReference && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                    Payment Reference
                  </label>
                  <p style={{ margin: 0, fontSize: "1rem", fontFamily: "monospace" }}>
                    {record.paymentReference}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mark as Paid Form */}
        {isPending && (
          <div className="panel-card" style={{ padding: "24px" }}>
            <h4 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
              Mark as Paid
            </h4>
            
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Payment Method <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)",
                    fontSize: "0.9rem"
                  }}
                  disabled={processing}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID, Cheque number, etc."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)",
                    fontSize: "0.9rem"
                  }}
                  disabled={processing}
                />
              </div>
            </div>

            <button
              onClick={handleMarkAsPaid}
              className="primary-action"
              disabled={processing}
              style={{ width: "auto" }}
            >
              {processing ? "Processing..." : "Mark as Paid"}
            </button>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="panel-card" style={{ padding: "24px" }}>
            <h4 style={{ marginTop: 0, marginBottom: "12px" }}>Notes</h4>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b", whiteSpace: "pre-wrap" }}>
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
