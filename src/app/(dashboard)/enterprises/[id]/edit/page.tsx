"use client";

import { useState, useEffect } from "react";

import { PageContentSkeleton } from "@/components/ui/AppShellSkeleton";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { enterpriseApi, packageApi, uploadApi, BillingPackage } from "@/lib/api";
import type { Enterprise } from "@/lib/types";
import Swal from "sweetalert2";

export default function EditEnterprisePage() {
  const router = useRouter();
  const params = useParams();
  const enterpriseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [packages, setPackages] = useState<BillingPackage[]>([]);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string>('');
  const [currentLogoPath, setCurrentLogoPath] = useState<string>('');

  useEffect(() => {
    packageApi.list({ includeInactive: false }).then((res) => {
      if (res.ok && res.packages) {
        setPackages(res.packages);
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

  useEffect(() => {
    loadEnterprise();
  }, [enterpriseId]);

  const loadEnterprise = async () => {
    try {
      setError(null);
      const result = await enterpriseApi.getById(enterpriseId);
      if (result.ok) {
        setEnterprise(result.enterprise);
        
        // Set logo preview if exists
        if (result.enterprise.logoUrl) {
          setCurrentLogoUrl(result.enterprise.logoUrl);
          setCurrentLogoPath(result.enterprise.logoStoragePath || '');
          setLogoPreview(uploadApi.getLogoUrl(result.enterprise.logoUrl));
        }
        
        setFormData({
          name: result.enterprise.name,
          generalEmail: result.enterprise.generalEmail,
          generalPhone: result.enterprise.generalPhone || "",
          apiUrl: result.enterprise.apiUrl || "",
          gstinNumber: result.enterprise.gstinNumber,
          panNumber: result.enterprise.panNumber,
          hqStreet: result.enterprise.hqStreet || "",
          hqCity: result.enterprise.hqCity || "",
          hqState: result.enterprise.hqState || "",
          hqPincode: result.enterprise.hqPincode || "",
          contactName: result.enterprise.contactName,
          contactDesignation: result.enterprise.contactDesignation || "",
          contactEmail: result.enterprise.contactEmail,
          contactPhone: result.enterprise.contactPhone || "",
          packageId: result.enterprise.packageId || "",
          billingCycle: result.enterprise.billingCycle,
          billingAmount: result.enterprise.billingAmount,
          nextBillingDate: result.enterprise.nextBillingDate || "",
          status: result.enterprise.status,
        });
      } else {
        setError("Enterprise not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enterprise");
    } finally {
      setLoading(false);
    }
  };

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
      
      // Delete old logo if exists
      if (currentLogoPath) {
        try {
          await uploadApi.deleteLogo(currentLogoPath);
        } catch (error) {
          console.warn("Failed to delete old logo:", error);
        }
      }

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
    setSaving(true);

    try {
      // Upload new logo if selected
      let uploadedLogo = null;
      if (logoFile) {
        uploadedLogo = await uploadLogo();
        if (!uploadedLogo) {
          setSaving(false);
          return; // Upload failed
        }
      }

      // Update enterprise with new logo URL if uploaded
      const updateData = {
        ...formData,
        ...(uploadedLogo && {
          logoUrl: uploadedLogo.url,
          logoStoragePath: uploadedLogo.path
        })
      };

      const result = await enterpriseApi.update(enterpriseId, updateData);

      
      if (result.ok) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Enterprise updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/enterprises");
      } else {
        console.error('Update failed:', result); // Debug log
        setError(result.error || "Failed to update enterprise");
      }
    } catch (err) {
      console.error('Update exception:', err); // Debug log
      setError(err instanceof Error ? err.message : "Failed to update enterprise");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <PageContentSkeleton />
      </section>
    );
  }

  if (error && !enterprise) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Management</p>
            <h3>Edit Enterprise</h3>
          </div>
        </div>
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#fee",
            color: "#c00",
            borderRadius: "8px",
            border: "1px solid #fcc",
          }}
        >
          {error}
        </div>
        <Link href="/enterprises" className="secondary-action" style={{ marginTop: "20px" }}>
          Back to Enterprises
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Management</p>
          <h3>Edit Enterprise: {enterprise?.name}</h3>
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
                maxLength={200}
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
                    disabled={uploading || saving}
                  />
                  <small style={{ color: "#64748b", fontSize: "0.8rem", display: "block", marginTop: 8 }}>
                    Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
                  </small>
                  {currentLogoUrl && !logoFile && (
                    <small style={{ color: "#10b981", fontSize: "0.8rem", display: "block", marginTop: 4 }}>
                      ✓ Current logo will be kept if no new file is selected
                    </small>
                  )}
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
                maxLength={200}
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
                pattern="\+?[0-9\s\-()]{10,20}"
                title="10-20 digits, optionally starting with +"
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
                maxLength={200}
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
                maxLength={500}
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
                  maxLength={100}
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
                  maxLength={100}
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
                maxLength={200}
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
                maxLength={200}
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
                maxLength={200}
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
                pattern="\+?[0-9\s\-()]{10,20}"
                title="10-20 digits, optionally starting with +"
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
                <option value="">Select a package...</option>
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
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="export-summary-btn"
            style={{ margin: 0 }}
            disabled={saving || uploading}
          >
            {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
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
