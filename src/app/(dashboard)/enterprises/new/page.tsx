"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { enterpriseApi, packageApi, uploadApi, BillingPackage } from "@/lib/api";
import Swal from "sweetalert2";

export default function NewEnterprisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  
  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Load packages on mount
  useEffect(() => {
    packageApi.list({ includeInactive: false }).then((res) => {
      if (res.ok && res.packages) {
        setPackages(res.packages);
        if (res.packages.length > 0 && !formData.packageId) {
          setFormData((prev) => ({ ...prev, packageId: res.packages![0].id }));
        }
      }
    });
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    generalEmail: "",
    generalPhone: "",
    apiUrl: "",
    gstinNumber: "",
    panNumber: "",
    hqStreet: "",
    hqCity: "",
    hqState: "",
    hqPincode: "",
    contactName: "",
    contactDesignation: "",
    contactEmail: "",
    contactPhone: "",
    packageId: "",
    billingCycle: "monthly" as "monthly" | "quarterly" | "yearly",
    billingAmount: 0,
    nextBillingDate: "",
    status: "active" as "active" | "inactive" | "suspended",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "billingAmount" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire("Error", "Please select an image file", "error");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Image must be less than 5MB", "error");
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload logo before submitting form
  const uploadLogo = async (): Promise<{ url: string; path: string } | null> => {
    if (!logoFile) return null;

    try {
      setUploading(true);
      const result = await uploadApi.uploadLogo(logoFile);
      return {
        url: result.data.logoUrl,
        path: result.data.storagePath
      };
    } catch (error) {
      console.error("Logo upload failed:", error);
      Swal.fire("Error", "Failed to upload logo", "error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Upload logo first if selected
      let uploadedLogo = null;
      if (logoFile) {
        uploadedLogo = await uploadLogo();
        if (!uploadedLogo) {
          setLoading(false);
          return; // Upload failed
        }
      }

      // Create enterprise with logo URL
      const enterpriseData = {
        ...formData,
        logoUrl: uploadedLogo?.url || '',
        logoStoragePath: uploadedLogo?.path || '',
      };

      const result = await enterpriseApi.create(enterpriseData);
      if (result.ok) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Enterprise created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/enterprises");
      } else {
        setError(result.error || "Failed to create enterprise");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create enterprise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Management</p>
          <h3>Create New Enterprise</h3>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "16px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            color: "#c00",
            borderRadius: "8px",
            border: "1px solid #fcc",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h4>Basic Information</h4>
            
            <label className="form-label">
              <span>Enterprise Name *</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter enterprise name"
              />
            </label>

            <label className="form-label">
              <span>Enterprise Logo</span>
              
              <div style={{ display: "flex", gap: 16, alignItems: "start" }}>
                {/* Preview */}
                {logoPreview && (
                  <div style={{
                    width: 100,
                    height: 100,
                    border: "2px solid #e2e8f0",
                    borderRadius: 8,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8fafc"
                  }}>
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                )}
                
                {/* File Input */}
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleLogoChange}
                    style={{ padding: "8px", width: "100%" }}
                    disabled={uploading || loading}
                  />
                  <small style={{ color: "#64748b", fontSize: "0.8rem", display: "block", marginTop: 8 }}>
                    Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
                  </small>
                </div>
              </div>
            </label>

            <label className="form-label">
              <span>General Email *</span>
              <input
                type="email"
                name="generalEmail"
                value={formData.generalEmail}
                onChange={handleChange}
                required
                placeholder="info@company.com"
              />
            </label>

            <label className="form-label">
              <span>General Phone</span>
              <input
                type="tel"
                name="generalPhone"
                value={formData.generalPhone}
                onChange={handleChange}
                placeholder="+91 1234567890"
              />
            </label>

            <label className="form-label">
              <span>API URL</span>
              <input
                type="url"
                name="apiUrl"
                value={formData.apiUrl}
                onChange={handleChange}
                placeholder="https://api.company.com"
              />
            </label>

            <label className="form-label">
              <span>Status</span>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>

          {/* Tax & Legal Information */}
          <div className="form-section">
            <h4>Tax & Legal Information</h4>
            
            <label className="form-label">
              <span>GSTIN Number *</span>
              <input
                type="text"
                name="gstinNumber"
                value={formData.gstinNumber}
                onChange={handleChange}
                required
                placeholder="22AAAAA0000A1Z5"
                pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                title="Format: 22AAAAA0000A1Z5"
              />
            </label>

            <label className="form-label">
              <span>PAN Number *</span>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                required
                placeholder="AAAAA0000A"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Format: AAAAA0000A"
              />
            </label>
          </div>

          {/* Headquarters Address */}
          <div className="form-section">
            <h4>Headquarters Address</h4>
            
            <label className="form-label">
              <span>Street Address</span>
              <input
                type="text"
                name="hqStreet"
                value={formData.hqStreet}
                onChange={handleChange}
                placeholder="Street address"
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="form-label">
                <span>City</span>
                <input
                  type="text"
                  name="hqCity"
                  value={formData.hqCity}
                  onChange={handleChange}
                  placeholder="City"
                />
              </label>

              <label className="form-label">
                <span>State</span>
                <input
                  type="text"
                  name="hqState"
                  value={formData.hqState}
                  onChange={handleChange}
                  placeholder="State"
                />
              </label>
            </div>

            <label className="form-label">
              <span>Pincode</span>
              <input
                type="text"
                name="hqPincode"
                value={formData.hqPincode}
                onChange={handleChange}
                placeholder="123456"
                pattern="[0-9]{6}"
                title="6-digit pincode"
              />
            </label>
          </div>

          {/* Contact Person */}
          <div className="form-section">
            <h4>Contact Person</h4>
            
            <label className="form-label">
              <span>Contact Name *</span>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </label>

            <label className="form-label">
              <span>Designation</span>
              <input
                type="text"
                name="contactDesignation"
                value={formData.contactDesignation}
                onChange={handleChange}
                placeholder="Manager, CEO, etc."
              />
            </label>

            <label className="form-label">
              <span>Contact Email *</span>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                placeholder="contact@company.com"
              />
            </label>

            <label className="form-label">
              <span>Contact Phone</span>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+91 1234567890"
              />
            </label>
          </div>

          {/* Billing Information */}
          <div className="form-section">
            <h4>Billing Information</h4>
            
            <label className="form-label">
              <span>Billing Package</span>
              <select
                name="packageId"
                value={formData.packageId}
                onChange={handleChange}
              >
                {packages.length === 0 && <option value="">Loading...</option>}
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} (${pkg.priceMonthly}/mo)
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              <span>Billing Cycle</span>
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>

            <label className="form-label">
              <span>Billing Amount (₹)</span>
              <input
                type="number"
                name="billingAmount"
                value={formData.billingAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </label>

            <label className="form-label">
              <span>Next Billing Date</span>
              <input
                type="date"
                name="nextBillingDate"
                value={formData.nextBillingDate}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #e2e8f0"
        }}>
          <button
            type="button"
            className="filter-reset-btn"
            style={{ margin: 0 }}
            onClick={() => router.push("/enterprises")}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="export-summary-btn"
            style={{ margin: 0 }}
            disabled={loading || uploading}
          >
            {uploading ? "Uploading..." : loading ? "Creating..." : "Create Enterprise"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .form-section {
          background: white;
          padding: 18px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .form-section h4 {
          margin: 0 0 14px 0;
          font-size: 1rem;
          color: #0f172a;
          font-weight: 600;
        }

        .form-label {
          display: block;
          margin-bottom: 12px;
        }

        .form-label span {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #475569;
          font-size: 0.8125rem;
        }

        .form-label input,
        .form-label select,
        .form-label textarea {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-label input:focus,
        .form-label select:focus,
        .form-label textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
