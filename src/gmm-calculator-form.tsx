import React, { useState } from 'react';

export default function GMMCalculator() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    klanttype: '',
    boottype: '',
    lengte: 8,
    gewicht: 2000,
    motor: '',
    water: '',
    duur: '',
    bedrijf: '',
    voornaam: '',
    achternaam: '',
    email: '',
    telefoon: ''
  });

  const colors = {
    greenMarine: '#14A073',
    greenMarineDark: '#0E8A63',
    darkSlate: '#264A42',
    charcoal: '#305850',
    forestMist: '#436860',
    antiqueGold: '#FDCB13',
    cream: '#FFFFFF',
    lightSage: '#D0DDD6',
    muted: '#7A8F86',
  };

  // Motor database gebaseerd op Green Marine specs
  const motors = [
    { model: 'GM5', kw: 5, pk: 15, maxLengte: 7, maxGewicht: 1500, koeling: 'Lucht', koppel: 40 },
    { model: 'GM7.5', kw: 7.5, pk: 25, maxLengte: 10, maxGewicht: 3000, koeling: 'Lucht', koppel: 60 },
    { model: 'GM10', kw: 10, pk: 35, maxLengte: 10, maxGewicht: 5000, koeling: 'Lucht', koppel: 80 },
    { model: 'GM17.5', kw: 17.5, pk: 50, maxLengte: 15, maxGewicht: 10000, koeling: 'Vloeistof', koppel: 140 },
    { model: 'GM22.5', kw: 22.5, pk: 60, maxLengte: 20, maxGewicht: 20000, koeling: 'Vloeistof', koppel: 180 },
    { model: 'GM35', kw: 35, pk: 90, maxLengte: 25, maxGewicht: 25000, koeling: 'Vloeistof', koppel: 270 },
    { model: 'GM45', kw: 45, pk: 120, maxLengte: 35, maxGewicht: 35000, koeling: 'Vloeistof', koppel: 360 },
    { model: 'GM60', kw: 60, pk: 150, maxLengte: 50, maxGewicht: 50000, koeling: 'Vloeistof', koppel: 470 },
  ];

  // Berekeningsfunctie voor motoraanbeveling
  const berekenAanbeveling = () => {
    const lengte = data.lengte;
    const gewicht = data.gewicht;
    const isKustwater = data.water === 'Kustwateren' || data.water === 'Beide';
    
    // Factor voor kustwateren (10-15% meer vermogen aanbevolen)
    const kustwaterFactor = isKustwater ? 1.15 : 1;
    const effectiefGewicht = gewicht * kustwaterFactor;

    // Vind de kleinste motor die voldoet aan beide eisen
    let aanbevolenMotor = motors.find(m => 
      m.maxLengte >= lengte && m.maxGewicht >= effectiefGewicht
    );

    // Als geen motor gevonden, neem de grootste
    if (!aanbevolenMotor) {
      aanbevolenMotor = motors[motors.length - 1];
    }

    // Batterijcapaciteit berekenen op basis van vaaruren
    // Aanname: gemiddeld 40-50% van max vermogen tijdens varen
    const gemiddeldVerbruik = aanbevolenMotor.kw * 0.45; // kWh per uur
    let vaaruren = 2; // default
    if (data.duur === '2-4 uur') vaaruren = 3;
    else if (data.duur === '4-8 uur') vaaruren = 6;
    else if (data.duur === '> 8 uur') vaaruren = 10;

    const benodigdeCapaciteit = gemiddeldVerbruik * vaaruren;
    // Batterijen zijn 5 kWh, we willen niet onder 20% komen (80% bruikbaar)
    const aantalBatterijen = Math.ceil(benodigdeCapaciteit / (5 * 0.8));
    const totaleCapaciteit = aantalBatterijen * 5;

    return {
      motor: aanbevolenMotor,
      batterijen: aantalBatterijen,
      capaciteit: totaleCapaciteit,
      geschatteVaartijd: Math.round((totaleCapaciteit * 0.8) / gemiddeldVerbruik * 10) / 10,
      isKustwater
    };
  };

  const totalSteps = 6; // Nu 6 stappen (inclusief resultaat)
  const progress = step === 0 ? 0 : (step / totalSteps) * 100;

  const update = (field, value) => setData({ ...data, [field]: value });
  const next = () => step < totalSteps && setStep(step + 1);
  const prev = () => step > 1 && setStep(step - 1);

  const Radio = ({ label, selected, onClick }) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 20px', background: selected ? colors.greenMarineDark : colors.forestMist, border: `2px solid ${selected ? colors.antiqueGold : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '12px' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selected ? colors.antiqueGold : colors.lightSage}`, marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.antiqueGold }} />}
      </div>
      <span style={{ fontFamily: 'system-ui', fontSize: '16px', color: colors.cream }}>{label}</span>
    </button>
  );

  const Tile = ({ icon, label, selected, onClick }) => (
    <button onClick={onClick} style={{ width: '100%', padding: '20px 16px', background: selected ? colors.greenMarine : colors.greenMarineDark, border: `2px solid ${selected ? colors.antiqueGold : colors.greenMarine}`, borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="48" height="48" viewBox="0 0 100 80" fill="none"><path d={icon} fill={colors.cream} /></svg>
      <span style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.cream }}>{label}</span>
    </button>
  );

  const SliderInput = ({ label, value, min, max, s, unit, onChange }) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.cream }}>{label}</span>
        <span style={{ fontFamily: 'system-ui', fontSize: '18px', fontWeight: '600', color: colors.antiqueGold }}>{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={s} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: '100%', accentColor: colors.antiqueGold }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '12px', color: colors.muted }}>{min} {unit}</span>
        <span style={{ fontSize: '12px', color: colors.muted }}>{max} {unit}</span>
      </div>
    </div>
  );

  const TextInput = ({ label, type, field, required, placeholder }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontFamily: 'system-ui', fontSize: '12px', fontWeight: '600', color: colors.lightSage, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label} {required && <span style={{ color: colors.antiqueGold }}>*</span>}
      </label>
      <input type={type} value={data[field]} onChange={(e) => update(field, e.target.value)} placeholder={placeholder} style={{ width: '100%', background: colors.darkSlate, border: `2px solid ${colors.forestMist}`, borderRadius: '8px', padding: '14px 16px', color: colors.cream, fontFamily: 'system-ui', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );

  const Nav = ({ canContinue = true, nextLabel = 'Volgende' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${colors.forestMist}` }}>
      {step > 1 ? <button onClick={prev} style={{ background: 'transparent', border: `2px solid ${colors.forestMist}`, borderRadius: '12px', padding: '14px 24px', color: colors.lightSage, fontFamily: 'system-ui', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Vorige</button> : <div />}
      <button onClick={next} disabled={!canContinue} style={{ background: canContinue ? colors.greenMarine : colors.forestMist, border: `2px solid ${canContinue ? colors.antiqueGold : colors.muted}`, borderRadius: '12px', padding: '14px 32px', color: canContinue ? colors.cream : colors.muted, fontFamily: 'system-ui', fontSize: '14px', fontWeight: '600', cursor: canContinue ? 'pointer' : 'not-allowed' }}>
        {nextLabel}
      </button>
    </div>
  );

  const Progress = () => (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ width: '100%', height: '6px', background: colors.forestMist, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: colors.antiqueGold, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <div style={{ textAlign: 'center', marginTop: '12px', fontFamily: 'system-ui', fontSize: '14px', color: colors.lightSage }}>
        Stap <span style={{ color: colors.antiqueGold, fontWeight: '600' }}>{step}</span> van {totalSteps}
      </div>
    </div>
  );

  const Container = ({ title, children }) => (
    <div style={{ background: colors.greenMarine, minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: colors.charcoal, borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <Progress />
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '600', color: colors.cream, margin: '0 0 24px 0', textAlign: 'center' }}>{title}</h2>
        {children}
      </div>
    </div>
  );

  // Startscherm
  if (step === 0) return (
    <div style={{ background: colors.greenMarine, minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: colors.darkSlate, borderRadius: '24px', padding: '48px 40px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'inline-flex', border: `2px solid ${colors.antiqueGold}`, borderRadius: '24px', padding: '10px 20px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'system-ui', fontSize: '12px', color: colors.antiqueGold, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specialist in elektrisch varen</span>
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '600', color: colors.cream, margin: '0 0 16px 0', lineHeight: '1.2' }}>Is jouw boot klaar voor elektrisch varen?</h1>
        <p style={{ fontFamily: 'system-ui', fontSize: '18px', color: colors.lightSage, margin: '0 0 32px 0', lineHeight: '1.5' }}>Ontdek binnen 2 minuten welke elektrische oplossing past bij jouw boot.</p>
        <button onClick={() => setStep(1)} style={{ height: '56px', padding: '0 48px', background: colors.greenMarine, border: `2px solid ${colors.antiqueGold}`, borderRadius: '12px', color: colors.cream, fontFamily: 'system-ui', fontSize: '17px', fontWeight: '600', cursor: 'pointer', marginBottom: '32px' }}>Start berekening</button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {['Gratis advies', 'Emissievrij', '€3.000 subsidie', '50+ installaties'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 18 18"><path d="M3 9L7 13L15 5" stroke={colors.antiqueGold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontFamily: 'system-ui', fontSize: '13px', color: colors.cream }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Bedankt scherm (nu stap 7)
  if (step === 7) return (
    <div style={{ background: colors.greenMarine, minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ width: '80px', height: '80px', background: colors.darkSlate, border: `3px solid ${colors.antiqueGold}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 36 36"><path d="M6 18L14 26L30 10" stroke={colors.antiqueGold} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', color: colors.cream, margin: '0 0 16px 0' }}>Bedankt{data.voornaam && `, ${data.voornaam}`}!</h2>
        <p style={{ fontFamily: 'system-ui', fontSize: '18px', color: colors.lightSage, margin: '0 0 32px 0', lineHeight: '1.5' }}>We nemen binnen 24 uur contact met je op met een persoonlijke offerte.</p>
        <button onClick={() => { setStep(0); setData({ klanttype: '', boottype: '', lengte: 8, gewicht: 2000, motor: '', water: '', duur: '', bedrijf: '', voornaam: '', achternaam: '', email: '', telefoon: '' }); }} style={{ background: 'transparent', border: `2px solid ${colors.antiqueGold}`, borderRadius: '12px', padding: '14px 32px', color: colors.antiqueGold, fontFamily: 'system-ui', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Terug naar home</button>
      </div>
    </div>
  );

  // Stap 1: Klanttype
  if (step === 1) return (
    <Container title="Bent u particulier of zakelijk?">
      <Radio label="Particulier" selected={data.klanttype === 'particulier'} onClick={() => update('klanttype', 'particulier')} />
      <Radio label="Zakelijk" selected={data.klanttype === 'zakelijk'} onClick={() => update('klanttype', 'zakelijk')} />
      <Nav canContinue={!!data.klanttype} />
    </Container>
  );

  // Stap 2: Boottype
  if (step === 2) return (
    <Container title="Wat voor type boot heeft u?">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Tile icon="M50 10L50 55M50 15L78 45L50 45ZM20 55Q50 72 80 55L75 68Q50 72 25 68Z" label="Zeilboot" selected={data.boottype === 'Zeilboot'} onClick={() => update('boottype', 'Zeilboot')} />
        <Tile icon="M15 45Q50 62 85 45L80 60Q50 66 20 60ZM28 30L72 30L72 48L28 48ZM60 20L70 20L70 30L60 30Z" label="Motorboot" selected={data.boottype === 'Motorboot'} onClick={() => update('boottype', 'Motorboot')} />
        <Tile icon="M15 50Q50 67 85 50L80 62Q50 68 20 62ZM22 38L78 38L78 52L22 52ZM62 28L70 28L70 38L62 38Z" label="Sloep" selected={data.boottype === 'Sloep'} onClick={() => update('boottype', 'Sloep')} />
        <Tile icon="M10 55Q50 70 90 55L85 65Q50 70 15 65ZM18 32L82 32L82 57L18 57ZM25 22L75 22L75 32L25 32Z" label="Woonboot" selected={data.boottype === 'Woonboot'} onClick={() => update('boottype', 'Woonboot')} />
      </div>
      <Nav canContinue={!!data.boottype} />
    </Container>
  );

  // Stap 3: Boot specificaties
  if (step === 3) return (
    <Container title="Boot specificaties">
      <SliderInput label="Lengte" value={data.lengte} min={4} max={20} s={0.5} unit="m" onChange={(v) => update('lengte', v)} />
      <SliderInput label="Gewicht (incl. lading)" value={data.gewicht} min={500} max={15000} s={100} unit="kg" onChange={(v) => update('gewicht', v)} />
      <p style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.cream, margin: '24px 0 12px' }}>Huidige aandrijving</p>
      {['Geen motor', 'Diesel', 'Benzine', 'Elektrisch (upgrade)'].map(m => <Radio key={m} label={m} selected={data.motor === m} onClick={() => update('motor', m)} />)}
      <Nav canContinue={!!data.motor} />
    </Container>
  );

  // Stap 4: Gebruik
  if (step === 4) return (
    <Container title="Hoe gebruikt u uw boot?">
      <p style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.cream, margin: '0 0 12px' }}>Waar vaart u voornamelijk?</p>
      {['Binnenwateren', 'Kustwateren', 'Beide'].map(w => <Radio key={w} label={w} selected={data.water === w} onClick={() => update('water', w)} />)}
      <p style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.cream, margin: '24px 0 12px' }}>Gemiddelde vaartocht</p>
      {['< 2 uur', '2-4 uur', '4-8 uur', '> 8 uur'].map(d => <Radio key={d} label={d} selected={data.duur === d} onClick={() => update('duur', d)} />)}
      <Nav canContinue={!!data.water && !!data.duur} nextLabel="Bekijk resultaat" />
    </Container>
  );

  // Stap 5: RESULTAAT (NIEUW!)
  if (step === 5) {
    const result = berekenAanbeveling();
    
    return (
      <div style={{ background: colors.greenMarine, minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: colors.charcoal, borderRadius: '24px', padding: '40px', maxWidth: '550px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <Progress />
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', border: `2px solid ${colors.antiqueGold}`, borderRadius: '24px', padding: '8px 16px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: '11px', color: colors.antiqueGold, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jouw aanbeveling</span>
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '600', color: colors.cream, margin: '0' }}>
              {result.motor.model} Elektromotor
            </h2>
          </div>

          {/* Motor specs */}
          <div style={{ background: colors.darkSlate, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: colors.forestMist, borderRadius: '12px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', color: colors.antiqueGold }}>{result.motor.kw}</div>
                <div style={{ fontFamily: 'system-ui', fontSize: '12px', color: colors.lightSage, textTransform: 'uppercase' }}>kW vermogen</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: colors.forestMist, borderRadius: '12px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', color: colors.antiqueGold }}>{result.motor.pk}</div>
                <div style={{ fontFamily: 'system-ui', fontSize: '12px', color: colors.lightSage, textTransform: 'uppercase' }}>PK equivalent</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: colors.forestMist, borderRadius: '12px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', color: colors.antiqueGold }}>{result.motor.koppel}</div>
                <div style={{ fontFamily: 'system-ui', fontSize: '12px', color: colors.lightSage, textTransform: 'uppercase' }}>Nm koppel</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: colors.forestMist, borderRadius: '12px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', color: colors.antiqueGold }}>{result.motor.koeling}</div>
                <div style={{ fontFamily: 'system-ui', fontSize: '12px', color: colors.lightSage, textTransform: 'uppercase' }}>Koeling</div>
              </div>
            </div>
          </div>

          {/* Batterij advies */}
          <div style={{ background: colors.darkSlate, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: colors.cream, margin: '0 0 16px 0' }}>Aanbevolen batterijcapaciteit</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.lightSage }}>Aantal GM Lithium batterijen</span>
              <span style={{ fontFamily: 'system-ui', fontSize: '18px', fontWeight: '600', color: colors.antiqueGold }}>{result.batterijen}x 5 kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.lightSage }}>Totale capaciteit</span>
              <span style={{ fontFamily: 'system-ui', fontSize: '18px', fontWeight: '600', color: colors.antiqueGold }}>{result.capaciteit} kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.lightSage }}>Geschatte vaartijd</span>
              <span style={{ fontFamily: 'system-ui', fontSize: '18px', fontWeight: '600', color: colors.antiqueGold }}>~{result.geschatteVaartijd} uur</span>
            </div>
          </div>

          {/* Jouw boot samenvatting */}
          <div style={{ background: colors.forestMist, borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ fontFamily: 'system-ui', fontSize: '13px', color: colors.lightSage, margin: '0', lineHeight: '1.6' }}>
              <strong style={{ color: colors.cream }}>Jouw boot:</strong> {data.boottype} van {data.lengte}m, {data.gewicht} kg
              {result.isKustwater && <span style={{ color: colors.antiqueGold }}> • Kustwater-geschikt</span>}
            </p>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'system-ui', fontSize: '14px', color: colors.lightSage, margin: '0 0 16px 0' }}>
              Ontvang een persoonlijke offerte op maat
            </p>
          </div>

          <Nav canContinue={true} nextLabel="Vraag offerte aan" />
        </div>
      </div>
    );
  }

  // Stap 6: Contactgegevens
  if (step === 6) return (
    <Container title="Contactgegevens">
      {data.klanttype === 'zakelijk' && <TextInput label="Bedrijfsnaam" type="text" field="bedrijf" required placeholder="Uw bedrijf" />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <TextInput label="Voornaam" type="text" field="voornaam" required placeholder="Jan" />
        <TextInput label="Achternaam" type="text" field="achternaam" required placeholder="Jansen" />
      </div>
      <TextInput label="Email" type="email" field="email" required placeholder="jan@voorbeeld.nl" />
      <TextInput label="Telefoon" type="tel" field="telefoon" required placeholder="06 12345678" />
      <p style={{ fontFamily: 'system-ui', fontSize: '13px', color: colors.muted, margin: '16px 0 0', lineHeight: '1.5' }}>We nemen contact op voor een vrijblijvende toelichting op basis van jouw aanbeveling.</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${colors.forestMist}` }}>
        <button onClick={prev} style={{ background: 'transparent', border: `2px solid ${colors.forestMist}`, borderRadius: '12px', padding: '14px 24px', color: colors.lightSage, fontFamily: 'system-ui', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Vorige</button>
        <button 
          onClick={() => setStep(7)} 
          disabled={!data.voornaam || !data.achternaam || !data.email || !data.telefoon}
          style={{ 
            background: (data.voornaam && data.achternaam && data.email && data.telefoon) ? colors.greenMarine : colors.forestMist, 
            border: `2px solid ${(data.voornaam && data.achternaam && data.email && data.telefoon) ? colors.antiqueGold : colors.muted}`, 
            borderRadius: '12px', 
            padding: '14px 32px', 
            color: (data.voornaam && data.achternaam && data.email && data.telefoon) ? colors.cream : colors.muted, 
            fontFamily: 'system-ui', 
            fontSize: '14px', 
            fontWeight: '600', 
            cursor: (data.voornaam && data.achternaam && data.email && data.telefoon) ? 'pointer' : 'not-allowed' 
          }}
        >
          Verstuur aanvraag
        </button>
      </div>
    </Container>
  );

  return null;
}
