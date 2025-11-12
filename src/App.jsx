import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default function App() {
  // Donor Registration
  const [donor, setDonor] = useState({
    name: '', email: '', phone: '', age: '', blood_group: 'O+', health_ok: true, city: ''
  })
  const [donorResult, setDonorResult] = useState(null)

  const [searchGroup, setSearchGroup] = useState('O+')
  const [donors, setDonors] = useState([])

  // Hospital
  const [hospital, setHospital] = useState({ name: '', email: '', phone: '', city: '' })
  const [hospitals, setHospitals] = useState([])

  // Inventory
  const [inventoryForm, setInventoryForm] = useState({ hospital_id: '', blood_group: 'O+', units: 1, expiry_date: '' })
  const [inventory, setInventory] = useState([])

  // Requests
  const [requestForm, setRequestForm] = useState({ donor_id: '', hospital_id: '', blood_group: 'O+', units: 1 })
  const [requests, setRequests] = useState([])

  const bloodGroups = useMemo(() => ['A+','A-','B+','B-','AB+','AB-','O+','O-'], [])

  const fetchHospitals = async () => {
    const res = await fetch(`${API}/hospitals`)
    const data = await res.json()
    setHospitals(data)
  }

  const fetchDonors = async (group) => {
    const res = await fetch(`${API}/donors?blood_group=${encodeURIComponent(group)}&eligible_only=true`)
    const data = await res.json()
    setDonors(data)
  }

  const fetchInventory = async () => {
    const res = await fetch(`${API}/inventory`)
    const data = await res.json()
    setInventory(data)
  }

  const fetchRequests = async () => {
    const res = await fetch(`${API}/requests`)
    const data = await res.json()
    setRequests(data)
  }

  useEffect(() => {
    fetchHospitals()
    fetchDonors(searchGroup)
    fetchInventory()
    fetchRequests()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Blood Donation Management</h1>
          <span className="text-sm text-gray-500">Demo</span>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Donor Registration & Eligibility">
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault()
              const payload = { ...donor, age: Number(donor.age), health_ok: Boolean(donor.health_ok) }
              const res = await fetch(`${API}/donors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
              const data = await res.json()
              setDonorResult(data)
              fetchDonors(searchGroup)
            }}>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Name" value={donor.name} onChange={e=>setDonor(d=>({...d,name:e.target.value}))} />
                <input className="input" placeholder="Email" value={donor.email} onChange={e=>setDonor(d=>({...d,email:e.target.value}))} />
                <input className="input" placeholder="Phone" value={donor.phone} onChange={e=>setDonor(d=>({...d,phone:e.target.value}))} />
                <input className="input" placeholder="City" value={donor.city} onChange={e=>setDonor(d=>({...d,city:e.target.value}))} />
                <input className="input" placeholder="Age" type="number" value={donor.age} onChange={e=>setDonor(d=>({...d,age:e.target.value}))} />
                <select className="input" value={donor.blood_group} onChange={e=>setDonor(d=>({...d,blood_group:e.target.value}))}>
                  {bloodGroups.map(g=> <option key={g} value={g}>{g}</option>)}
                </select>
                <label className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={donor.health_ok} onChange={e=>setDonor(d=>({...d,health_ok:e.target.checked}))} />
                  I am in good health and meet donation criteria
                </label>
              </div>
              <button className="btn">Register</button>
            </form>
            {donorResult && (
              <p className={`mt-3 text-sm ${donorResult.eligible ? 'text-emerald-600' : 'text-red-600'}`}>
                Registration saved. Eligibility: {donorResult.eligible ? 'Eligible' : 'Not Eligible'}
              </p>
            )}
          </Section>

          <Section title="Search Donors by Blood Group">
            <div className="flex items-center gap-3 mb-3">
              <select className="input" value={searchGroup} onChange={e=>{setSearchGroup(e.target.value); fetchDonors(e.target.value)}}>
                {bloodGroups.map(g=> <option key={g} value={g}>{g}</option>)}
              </select>
              <button className="btn" onClick={()=>fetchDonors(searchGroup)}>Search</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-auto pr-2">
              {donors.map(d=> (
                <div key={d.id} className="p-3 rounded-lg border bg-gray-50">
                  <div className="font-medium">{d.name} • {d.blood_group}</div>
                  <div className="text-sm text-gray-600">{d.email} • {d.phone} • {d.city}</div>
                </div>
              ))}
              {donors.length===0 && <p className="text-sm text-gray-500">No donors found.</p>}
            </div>
          </Section>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Hospital Management">
            <form className="space-y-3" onSubmit={async (e)=>{
              e.preventDefault()
              const res = await fetch(`${API}/hospitals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hospital) })
              await res.json()
              setHospital({ name: '', email: '', phone: '', city: '' })
              fetchHospitals()
            }}>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Name" value={hospital.name} onChange={e=>setHospital(h=>({...h,name:e.target.value}))} />
                <input className="input" placeholder="Email" value={hospital.email} onChange={e=>setHospital(h=>({...h,email:e.target.value}))} />
                <input className="input" placeholder="Phone" value={hospital.phone} onChange={e=>setHospital(h=>({...h,phone:e.target.value}))} />
                <input className="input" placeholder="City" value={hospital.city} onChange={e=>setHospital(h=>({...h,city:e.target.value}))} />
              </div>
              <button className="btn">Add Hospital</button>
            </form>
            <div className="space-y-2 mt-3 max-h-56 overflow-auto pr-2">
              {hospitals.map(h=> (
                <div key={h.id} className="p-3 rounded-lg border bg-gray-50">
                  <div className="font-medium">{h.name}</div>
                  <div className="text-sm text-gray-600">{h.email} • {h.phone} • {h.city}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Inventory Tracking">
            <form className="space-y-3" onSubmit={async (e)=>{
              e.preventDefault()
              const payload = { ...inventoryForm, units: Number(inventoryForm.units) }
              const res = await fetch(`${API}/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
              await res.json()
              fetchInventory()
            }}>
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={inventoryForm.hospital_id} onChange={e=>setInventoryForm(f=>({...f,hospital_id:e.target.value}))}>
                  <option value="">Select hospital</option>
                  {hospitals.map(h=>(<option key={h.id} value={h.id}>{h.name}</option>))}
                </select>
                <select className="input" value={inventoryForm.blood_group} onChange={e=>setInventoryForm(f=>({...f,blood_group:e.target.value}))}>
                  {bloodGroups.map(g=> <option key={g} value={g}>{g}</option>)}
                </select>
                <input className="input" placeholder="Units" type="number" value={inventoryForm.units} onChange={e=>setInventoryForm(f=>({...f,units:e.target.value}))} />
                <input className="input" placeholder="Expiry" type="date" value={inventoryForm.expiry_date} onChange={e=>setInventoryForm(f=>({...f,expiry_date:e.target.value}))} />
              </div>
              <button className="btn">Add Donation</button>
            </form>
            <div className="space-y-2 mt-3 max-h-56 overflow-auto pr-2">
              {inventory.map(i=> (
                <div key={i.id} className="p-3 rounded-lg border bg-gray-50">
                  <div className="font-medium">{i.blood_group} • {i.units} unit(s)</div>
                  <div className="text-sm text-gray-600">Hospital: {i.hospital_id} • Exp: {i.expiry_date}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Request & Approval">
          <form className="space-y-3" onSubmit={async (e)=>{
            e.preventDefault()
            const payload = { ...requestForm, units: Number(requestForm.units) }
            const res = await fetch(`${API}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            await res.json()
            fetchRequests()
          }}>
            <div className="grid md:grid-cols-4 grid-cols-2 gap-3">
              <select className="input" value={requestForm.hospital_id} onChange={e=>setRequestForm(f=>({...f,hospital_id:e.target.value}))}>
                <option value="">Hospital</option>
                {hospitals.map(h=>(<option key={h.id} value={h.id}>{h.name}</option>))}
              </select>
              <select className="input" value={requestForm.donor_id} onChange={e=>setRequestForm(f=>({...f,donor_id:e.target.value}))}>
                <option value="">Donor</option>
                {donors.map(d=>(<option key={d.id} value={d.id}>{d.name} ({d.blood_group})</option>))}
              </select>
              <select className="input" value={requestForm.blood_group} onChange={e=>setRequestForm(f=>({...f,blood_group:e.target.value}))}>
                {bloodGroups.map(g=> <option key={g} value={g}>{g}</option>)}
              </select>
              <input className="input" placeholder="Units" type="number" value={requestForm.units} onChange={e=>setRequestForm(f=>({...f,units:e.target.value}))} />
            </div>
            <button className="btn">Create Request</button>
          </form>
          <div className="space-y-2 mt-3">
            {requests.map(r=> (
              <div key={r.id} className="p-3 rounded-lg border bg-gray-50 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.blood_group} • {r.units} unit(s)</div>
                  <div className="text-sm text-gray-600">Hospital: {r.hospital_id} • Donor: {r.donor_id} • Status: {r.status}</div>
                </div>
                {r.status==='pending' && (
                  <div className="flex gap-2">
                    <button className="btn !bg-emerald-600" onClick={async ()=>{
                      await fetch(`${API}/requests/${r.id}/status`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'approved'}) })
                      fetchRequests()
                    }}>Approve</button>
                    <button className="btn !bg-red-600" onClick={async ()=>{
                      await fetch(`${API}/requests/${r.id}/status`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'declined'}) })
                      fetchRequests()
                    }}>Decline</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        <footer className="pt-6 text-center text-xs text-gray-500">Notifications are stored as records; integrating with real SMS/Email providers can be added.</footer>
      </div>

      <style>{`
        .input{ @apply w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 outline-none bg-white; }
        .btn{ @apply inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-sm font-medium transition; }
      `}</style>
    </div>
  )
}
