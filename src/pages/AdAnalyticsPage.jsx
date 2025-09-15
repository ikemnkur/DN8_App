import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdAnalyticsPage = ({ ads = [], onEditAd }) => {
  const [selectedAd, setSelectedAd] = useState(null);
  const navigate = useNavigate();

  console.log('AdAnalyticsPage ads:', ads);

  const totalSpent = ads.reduce((sum, ad) => sum + ad.spent, 0);
  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
  const totalCompletions = ads.reduce((sum, ad) => sum + ad.completions, 0);
  const activeAds = ads.filter(ad => ad.active).length;


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(210, 216, 247) 0%,rgb(187, 167, 208) 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'white',
            fontSize: '40px'
          }}>
            📊
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            Analytics
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
            fontWeight: 400,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Track your ad performance and optimize your campaigns
          </p>
        </div>

       
        {/* Ads Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px 32px',
            borderBottom: '2px solid rgba(0, 0, 0, 0.05)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Your Advertisements
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Title
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Format
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Budget
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Spent
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Views
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Completions
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr
                    key={ad.id}
                    style={{
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.8)', marginBottom: '4px' }}>
                        {ad.title}
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.5)' }}>
                        {ad.description?.substring(0, 50)}...
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {ad.format}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', fontWeight: 600 }}>
                      {ad.budget} credits
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.spent} credits
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.5)' }}>
                        {((ad.spent / ad.budget) * 100).toFixed(1)}% used
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontWeight: 600 }}>
                      {ad.views}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.completions}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.5)' }}>
                        {ad.views > 0 ? ((ad.completions / ad.views) * 100).toFixed(1) : 0}% rate
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: ad.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: ad.active ? '#059669' : '#dc2626',
                        border: `2px solid ${ad.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      }}>
                        {ad.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedAd(ad)}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={
                            () =>  // Optional: navigate to preview of the created ad
                              setTimeout(() => {
                                navigate(`/preview-ad/${ad.id}`);
                              }, 500)
                            // () => onEditAd(ad)
                          }
                          style={{
                            padding: '8px',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'rgba(0, 0, 0, 0.5)',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '16px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                            e.target.style.color = '#667eea';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                            e.target.style.color = 'rgba(0, 0, 0, 0.5)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View Modal */}
        {selectedAd && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px 32px',
                borderRadius: '24px 24px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  {selectedAd.title}
                </h3>
                <button
                  onClick={() => setSelectedAd(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '32px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.6)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Campaign Details
                    </h4>
                    <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(0, 0, 0, 0.7)' }}>
                      <p style={{ margin: '4px 0' }}><strong>Format:</strong> {selectedAd.format}</p>
                      <p style={{ margin: '4px 0' }}><strong>Budget:</strong> {selectedAd.budget} credits</p>
                      <p style={{ margin: '4px 0' }}><strong>Spent:</strong> {selectedAd.spent} credits</p>
                      <p style={{ margin: '4px 0' }}><strong>Remaining:</strong> {selectedAd.budget - selectedAd.spent} credits</p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid rgba(16, 185, 129, 0.1)'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.6)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Performance
                    </h4>
                    <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(0, 0, 0, 0.7)' }}>
                      <p style={{ margin: '4px 0' }}><strong>Views:</strong> {selectedAd.views}</p>
                      <p style={{ margin: '4px 0' }}><strong>Completions:</strong> {selectedAd.completions}</p>
                      <p style={{ margin: '4px 0' }}><strong>Completion Rate:</strong> {selectedAd.views > 0 ? ((selectedAd.completions / selectedAd.views) * 100).toFixed(1) : 0}%</p>
                      <p style={{ margin: '4px 0' }}><strong>Cost per View:</strong> {selectedAd.views > 0 ? (selectedAd.spent / selectedAd.views).toFixed(2) : 0} credits</p>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(245, 158, 11, 0.1)',
                  marginBottom: '32px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    color: 'rgba(0, 0, 0, 0.8)'
                  }}>
                    Quiz Questions ({selectedAd.quiz?.length || 0})
                  </h4>
                  {selectedAd.quiz?.map((question, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <p style={{
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: 'rgba(0, 0, 0, 0.8)'
                      }}>
                        {index + 1}. {question.question}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        margin: 0
                      }}>
                        Type: {question.type}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={() => {
                      onEditAd(selectedAd);
                      setSelectedAd(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'white',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    Edit Ad
                  </button>
                  <button
                    onClick={() => setSelectedAd(null)}
                    style={{
                      padding: '12px 24px',
                      border: '2px solid rgba(0, 0, 0, 0.2)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'rgba(0, 0, 0, 0.7)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdAnalyticsPage;