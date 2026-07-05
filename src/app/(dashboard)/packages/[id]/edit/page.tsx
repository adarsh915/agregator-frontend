"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { packageApi } from "@/lib/api";

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceMonthly: 0,
    priceYearly: 0,
    features: [""],
  });

  useEffect(() => {
    loadPackage();
  }, [packageId]);

  const loadPackage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await packageApi.get(packageId);
      if (res.ok && res.package) {
        const pkg = res.package;
        setFormData({
          name: pkg.name,
          description: pkg.description || "",
          priceMonthly: pkg.priceMonthly,
          priceYearly: pkg.priceYearly,
          features: pkg.features && pkg.features.length > 0 ? pkg.features : [""],
        });
      } else {
        setError(res.error || "Failed to load package");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    if (formData.features.length === 1) return;
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Clean empty features
    const cleanedFeatures = formData.features.filter((f) => f.trim() !== "");

    try {
      const res = await packageApi.update(packageId, {
        ...formData,
        features: cleanedFeatures,
      });

      if (res.ok) {
        router.push("/packages");
      } else {
        setError(res.error || "Failed to update package");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <p style={{ color: "#64748b" }}>Loading package...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Management</p>
          <h3>Edit Billing Package</h3>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "16px",
          marginBottom: "20px",
          backgroundColor: "#fee",
          color: "#c00",
          borderRadius: "8px",
          border: "1px solid #fcc"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Package Details */}
          <div className="form-section">
            <h4>Package Details</h4>
            
            <label className="form-label">
              <span>Package Name *</span>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Starter, Professional, Enterprise"
              />
            </label>

            <label className="form-label">
              <span>Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of who this plan is for..."
                rows={4}
                style={{ fontFamily: 'inherit', resize: 'vertical' }}
              />
            </label>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h4>Pricing</h4>
            
            <label className="form-label">
              <span>Monthly Price ($) *</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.priceMonthly}
                onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </label>

            <label className="form-label">
              <span>Yearly Price ($) *</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.priceYearly}
                onChange={(e) => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              <small style={{ display: 'block', marginTop: 4, color: '#64748b', fontSize: '0.8rem' }}>
                Typically 10-20% discount on monthly rate
              </small>
            </label>
          </div>

          {/* Features */}
          <div className="form-section" style={{ gridColumn: '1 / -1' }}>
            <h4>Package Features</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {formData.features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder="e.g. Up to 10 users, 5GB storage, Email support"
                    style={{ 
                      flex: 1, 
                      padding: '10px 12px', 
                      borderRadius: 6, 
                      border: '1px solid #cbd5e1', 
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    disabled={formData.features.length === 1}
                    style={{
                      padding: '10px 16px',
                      background: formData.features.length === 1 ? '#f1f5f9' : 'transparent',
                      color: formData.features.length === 1 ? '#94a3b8' : '#dc2626',
                      border: formData.features.length === 1 ? '1px solid #e2e8f0' : '1px solid #fca5a5',
                      borderRadius: 6,
                      cursor: formData.features.length === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.features.length > 1) {
                        e.currentTarget.style.background = '#fee2e2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.features.length > 1) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addFeature}
              style={{
                marginTop: 12,
                background: 'transparent',
                border: '1px dashed #cbd5e1',
                padding: '10px 16px',
                borderRadius: 6,
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              + Add Another Feature
            </button>
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid #e2e8f0"
        }}>
          <button
            type="button"
            className="filter-reset-btn"
            style={{ margin: 0 }}
            onClick={() => router.push("/packages")}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="export-summary-btn"
            style={{ margin: 0 }}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .form-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .form-section h4 {
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          color: #0f172a;
          font-weight: 600;
        }

        .form-label {
          display: block;
          margin-bottom: 16px;
        }

        .form-label:last-child {
          margin-bottom: 0;
        }

        .form-label span {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #475569;
          font-size: 0.875rem;
        }

        .form-label input,
        .form-label select,
        .form-label textarea {
          width: 100%;
          padding: 10px 12px;
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
