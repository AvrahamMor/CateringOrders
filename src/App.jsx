import React, { useState, useEffect } from 'react';
import { Settings, Calculator, Plus, Minus, RotateCcw, Printer } from 'lucide-react';
import { ITEMS, CATEGORIES, PACKAGE_TYPES, GROUP_SIZES, DEFAULT_TEMPLATES } from './data/items';

function App() {
  const [activeTab, setActiveTab] = useState('calc'); // 'calc' or 'templates'
  
  // -- State: Templates (The constants per couple for each package type) --
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('catering_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  // -- State: Quantities (How many groups of each size for each package type) --
  // Format: { "מארז VIP": { 2: 6, 3: 4, 5: 2, 6: 7 }, ... }
  const [quantities, setQuantities] = useState(() => {
    const saved = localStorage.getItem('catering_quantities');
    if (saved) return JSON.parse(saved);
    const initial = {};
    PACKAGE_TYPES.forEach(pt => {
      initial[pt] = {};
      GROUP_SIZES.forEach(gs => initial[pt][gs.id] = 0);
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('catering_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('catering_quantities', JSON.stringify(quantities));
  }, [quantities]);

  const updateQuantity = (pkg, sizeId, change) => {
    setQuantities(prev => {
      const current = prev[pkg][sizeId] || 0;
      const newQty = Math.max(0, current + change);
      return {
        ...prev,
        [pkg]: { ...prev[pkg], [sizeId]: newQty }
      };
    });
  };

  const updateTemplateValue = (pkg, itemId, value) => {
    const val = parseInt(value) || 0;
    setTemplates(prev => ({
      ...prev,
      [pkg]: { ...prev[pkg], [itemId]: Math.max(0, val) }
    }));
  };

  const resetQuantities = () => {
    if (window.confirm('האם לאפס את כל כמויות ההזמנות במחשבון?')) {
      const initial = {};
      PACKAGE_TYPES.forEach(pt => {
        initial[pt] = {};
        GROUP_SIZES.forEach(gs => initial[pt][gs.id] = 0);
      });
      setQuantities(initial);
    }
  };

  const resetTemplates = () => {
    if (window.confirm('האם לאפס את התבניות לברירת המחדל? פעולה זו תמחק את השינויים שלך בתקן.')) {
      setTemplates(DEFAULT_TEMPLATES);
    }
  };

  // -- Calculation Logic --
  const calculateTotals = () => {
    const totals = {};
    const boxTotals = {};
    let totalDiners = 0;
    let totalPackages = 0;

    PACKAGE_TYPES.forEach(pkg => {
      GROUP_SIZES.forEach(gs => {
        const count = quantities[pkg][gs.id];
        if (count > 0) {
          totalPackages += count;
          totalDiners += (count * gs.id);

          // For each item in the template of this package
          ITEMS.forEach(item => {
            const baseAmount = templates[pkg][item.id] || 0;
            if (baseAmount > 0) {
              // Formula: Floor( BaseAmount * (Size / 2) ) * number of this group size
              const multiplier = gs.id / 2;
              const amountPerGroup = Math.floor(baseAmount * multiplier);
              const totalAmount = amountPerGroup * count;

              if (amountPerGroup > 0) {
                if (!totals[item.id]) totals[item.id] = 0;
                totals[item.id] += totalAmount;

                if (!boxTotals[item.id]) boxTotals[item.id] = {};
                if (!boxTotals[item.id][gs.id]) boxTotals[item.id][gs.id] = 0;
                boxTotals[item.id][gs.id] += count;
              }
            }
          });
        }
      });
    });

    return { totals, boxTotals, totalDiners, totalPackages };
  };

  const { totals, boxTotals, totalDiners, totalPackages } = calculateTotals();

  // Selected package for template editing
  const [selectedEditPkg, setSelectedEditPkg] = useState(PACKAGE_TYPES[0]);

  return (
    <>
      <header className="app-header">
        <Calculator size={36} color="var(--primary)" />
        <h1>מחשבון מארזים חכם</h1>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'calc' ? 'active' : ''}`}
          onClick={() => setActiveTab('calc')}
        >
          <Calculator size={20} /> מחשבון כמויות
        </button>
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <Settings size={20} /> עריכת תבניות (קבועים)
        </button>
      </div>

      {activeTab === 'calc' && (
        <div className="calc-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>הזנת כמויות המארזים</h2>
              <button onClick={resetQuantities} className="clear-data-btn">
                <RotateCcw size={18} /> איפוס כל הכמויות
              </button>
            </div>

            <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {PACKAGE_TYPES.map(pkg => (
                <div key={pkg} className="package-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>{pkg}</h3>
                  {GROUP_SIZES.map(gs => (
                    <div key={gs.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span>{gs.name}</span>
                      <div className="quantity-controls">
                        <button type="button" className="qty-btn" onClick={() => updateQuantity(pkg, gs.id, -1)}><Minus size={14}/></button>
                        <span className="qty-display">{quantities[pkg][gs.id]}</span>
                        <button type="button" className="qty-btn" onClick={() => updateQuantity(pkg, gs.id, 1)}><Plus size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel summary-dashboard">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              סיכום תוצאות המחשבון (רשימת איסוף)
            </h2>

            {Object.keys(totals).length > 0 && (
              <button 
                onClick={() => window.print()} 
                className="print-btn" 
                style={{ 
                  background: 'var(--primary)', 
                  color: '#121212', 
                  border: 'none', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold', 
                  margin: '0 auto 2rem auto',
                  transition: 'all 0.3s'
                }}
              >
                <Printer size={20} /> ייצא ל-PDF / הדפס רשימה
              </button>
            )}

            <div className="summary-stats">
              <div className="stat-box">
                <h3>סה"כ מארזים לחלוקה</h3>
                <div className="value">{totalPackages}</div>
              </div>
              <div className="stat-box">
                <h3>סה"כ סועדים (מנות)</h3>
                <div className="value">{totalDiners}</div>
              </div>
            </div>

            {Object.keys(totals).length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>הזן כמויות במחשבון כדי לראות את רשימת האיסוף...</p>
            ) : (
              Object.entries(CATEGORIES).map(([catKey, catName]) => {
                const catItems = ITEMS.filter(item => item.category === catKey && totals[item.id] > 0);
                if (catItems.length === 0) return null;

                const isSalad = catKey === 'salads';

                return (
                  <div key={catKey} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{catName}</h3>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'right', width: isSalad ? 'auto' : '30%' }}>מוצר</th>
                            {isSalad ? (
                              <th style={{ textAlign: 'left', width: '180px' }}>כמות כוללת לאסוף</th>
                            ) : (
                              <>
                                <th style={{ textAlign: 'right' }}>פירוט קופסאות לאריזה</th>
                                <th style={{ textAlign: 'left', width: '120px' }}>סה"כ מנות</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {catItems.map(item => {
                            if (isSalad) {
                              return (
                                <tr key={item.id}>
                                  <td style={{ fontSize: '1.1rem' }}>{item.name}</td>
                                  <td style={{ textAlign: 'left' }} className="total-qty">{totals[item.id]}</td>
                                </tr>
                              );
                            }

                            const itemBoxes = boxTotals[item.id] || {};
                            const boxEntries = Object.entries(itemBoxes)
                              .filter(([_, count]) => count > 0)
                              .sort(([a], [b]) => Number(a) - Number(b));

                            return (
                              <tr key={item.id}>
                                <td style={{ fontSize: '1.1rem', fontWeight: '500', verticalAlign: 'top' }}>{item.name}</td>
                                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                  <div className="box-breakdown-tags">
                                    {boxEntries.map(([sizeStr, count]) => {
                                      const size = Number(sizeStr);
                                      const label = size === 2 
                                        ? `${count} קופסאות של 2 ליטר (זוגיות)`
                                        : `${count} קופסאות של ${size} ליטר`;
                                      return (
                                        <span key={size} className="box-tag">
                                          {label}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'left', verticalAlign: 'top' }} className="total-qty">{totals[item.id]}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>עריכת תבניות (קבועים לזוג)</h2>
              <p style={{ color: 'var(--text-muted)' }}>קבע כמה יחידות/מנות מזון יש לשים במארז <b>עבור זוג (2 סועדים)</b>.</p>
              <p style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '0.5rem' }}>המערכת תדע להכפיל ולעגל כלפי מטה אוטומטית לשלישיות, חמישיות וכו'.</p>
            </div>
            
            <button onClick={resetTemplates} className="clear-data-btn">
              <RotateCcw size={18} /> שחזר תבניות לברירת מחדל
            </button>
          </div>

          <div className="form-group" style={{ maxWidth: '300px', marginBottom: '2rem' }}>
            <label>בחר מארז לעריכה:</label>
            <select value={selectedEditPkg} onChange={e => setSelectedEditPkg(e.target.value)}>
              {PACKAGE_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="items-selection" style={{ padding: 0 }}>
            {Object.entries(CATEGORIES).map(([catKey, catName]) => {
              const catItems = ITEMS.filter(item => item.category === catKey);
              if (catItems.length === 0) return null;

              return (
                <div key={catKey} className="category-section" style={{ marginBottom: '2rem' }}>
                  <h3 className="category-title" style={{ fontSize: '1.2rem' }}>{catName}</h3>
                  <div className="items-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                    {catItems.map(item => {
                      const val = templates[selectedEditPkg][item.id] || 0;
                      return (
                        <div key={item.id} className="item-card" style={{ padding: '0.75rem 1rem' }}>
                          <span className="item-name" style={{ fontSize: '0.9rem' }}>{item.name}</span>
                          <input 
                            type="number" 
                            min="0"
                            value={val}
                            onChange={(e) => updateTemplateValue(selectedEditPkg, item.id, e.target.value)}
                            style={{ width: '60px', padding: '0.3rem', textAlign: 'center', background: 'rgba(255,255,255,0.1)' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
