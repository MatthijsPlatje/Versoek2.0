// client/src/pages/Home.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const [showReferences, setShowReferences] = useState(false);
  
  const features = [
    {
      icon: '🚗',
      title: t('home.features.parkingCosts.title'),
      description: t('home.features.parkingCosts.description'),
      references: ['[1]', '[3]']
    },
    {
      icon: '🌱',
      title: t('home.features.sustainability.title'),
      description: t('home.features.sustainability.description'),
      references: ['[1]', '[2]', '[4]']
    },
    {
      icon: '😊',
      title: t('home.features.satisfaction.title'),
      description: t('home.features.satisfaction.description'),
      references: ['[4]']
    },
    {
      icon: '💰',
      title: t('home.features.transportation.title'),
      description: t('home.features.transportation.description'),
      references: ['[3]']
    },
    {
      icon: '📅',
      title: t('home.features.scheduling.title'),
      description: t('home.features.scheduling.description'),
      references: ['[2]']
    },
    {
      icon: '🔔',
      title: t('home.features.communication.title'),
      description: t('home.features.communication.description'),
      references: ['[4]']
    }
  ];

  const stats = [
    { number: '50%', label: t('home.stats.higherUsage'), ref: '[3]' },
    { number: '30%', label: t('home.stats.lessParking'), ref: '[1][2]' },
    { number: '11-22%', label: t('home.stats.carbonReduction'), ref: '[1][2][5]' },
    { number: '80%', label: t('home.stats.moreSatisfied'), ref: '[4]' }
  ];

  const references = [
    "International Transport Forum (ITF) - Global carpooling emissions and parking impact data",
    "Nature Journal 2024 - Urban carpooling efficiency study showing 25% fleet reduction potential",
    "Carpool-as-a-Service Market Analysis 2025-2034 - 10.6% annual growth and usage statistics", 
    "Netherlands Event Carpooling Case Studies 2024 - 80% user satisfaction and social benefits",
    "ScienceDirect 2025 - Carbon savings in ride-pooling research, route-based analysis"
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            {t('home.hero.title')}
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: '40px',
            opacity: '0.95',
            maxWidth: '800px',
            margin: '0 auto 40px'
          }}>
            {t('home.hero.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: 'white',
                color: '#667eea',
                padding: '15px 40px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {t('home.hero.demoButton')}
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: 'transparent',
                color: 'white',
                padding: '15px 40px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: '2px solid white',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
              >
                {t('home.hero.tryButton')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '50px',
            color: '#2c3e50'
          }}>
            {t('home.stats.title')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ padding: '20px' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#667eea',
                  marginBottom: '10px'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  color: '#555',
                  marginBottom: '5px'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  fontStyle: 'italic'
                }}>
                  {stat.ref}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '40px' }}>
            <button 
              onClick={() => setShowReferences(!showReferences)}
              style={{
                background: 'none',
                border: '1px solid #667eea',
                color: '#667eea',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {showReferences ? 'Hide References' : 'View Research Sources'}
            </button>
          </div>
        </div>
      </section>

      {/* References Section (Collapsible) */}
      {showReferences && (
        <section style={{
          padding: '40px 20px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e0e0e0'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '20px',
              color: '#2c3e50',
              textAlign: 'center'
            }}>
              Research Sources & References
            </h3>
            <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.8' }}>
              {references.map((ref, index) => (
                <p key={index} style={{ marginBottom: '10px' }}>
                  <strong>[{index + 1}]</strong> {ref}
                </p>
              ))}
            </div>
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#888', 
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              All statistics based on peer-reviewed research and industry studies conducted 2024-2025
            </p>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            textAlign: 'center',
            marginBottom: '20px',
            color: '#2c3e50'
          }}>
            {t('home.features.title')}
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '60px',
            maxWidth: '700px',
            margin: '0 auto 60px'
          }}>
            {t('home.features.subtitle')}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                padding: '30px',
                borderRadius: '12px',
                backgroundColor: '#f8f9fa',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  marginBottom: '15px',
                  color: '#2c3e50'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '10px'
                }}>
                  {feature.description}
                </p>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  fontStyle: 'italic'
                }}>
                  {feature.references.join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            textAlign: 'center',
            marginBottom: '60px',
            color: '#2c3e50'
          }}>
            {t('home.howItWorks.title')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            {[
              {
                step: '1',
                title: t('home.howItWorks.step1.title'),
                description: t('home.howItWorks.step1.description')
              },
              {
                step: '2',
                title: t('home.howItWorks.step2.title'),
                description: t('home.howItWorks.step2.description')
              },
              {
                step: '3',
                title: t('home.howItWorks.step3.title'),
                description: t('home.howItWorks.step3.description')
              }
            ].map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 20px'
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  marginBottom: '15px',
                  color: '#2c3e50'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            textAlign: 'center',
            marginBottom: '60px',
            color: '#2c3e50'
          }}>
            {t('home.useCases.title')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                title: t('home.useCases.enterprise.title'),
                description: t('home.useCases.enterprise.description'),
                icon: '🏢'
              },
              {
                title: t('home.useCases.tech.title'),
                description: t('home.useCases.tech.description'),
                icon: '💻'
              },
              {
                title: t('home.useCases.healthcare.title'),
                description: t('home.useCases.healthcare.description'),
                icon: '🏥'
              },
              {
                title: t('home.useCases.manufacturing.title'),
                description: t('home.useCases.manufacturing.description'),
                icon: '🏭'
              }
            ].map((useCase, index) => (
              <div key={index} style={{
                padding: '30px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                  {useCase.icon}
                </div>
                <h3 style={{
                  fontSize: '1.4rem',
                  marginBottom: '15px',
                  color: '#2c3e50'
                }}>
                  {useCase.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            {t('home.cta.title')}
          </h2>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '40px',
            opacity: '0.95'
          }}>
            {t('home.cta.subtitle')}
          </p>
          <Link to="/contact" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: 'white',
              color: '#667eea',
              padding: '18px 50px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {t('home.cta.button')}
            </button>
          </Link>
          <p style={{
            marginTop: '20px',
            fontSize: '0.95rem',
            opacity: '0.8'
          }}>
            {t('home.cta.disclaimer')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
