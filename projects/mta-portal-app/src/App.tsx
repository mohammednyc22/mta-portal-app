import { useState, useEffect } from 'react'

interface SubwayLine {
  name: string
  color: string
  textColor: string
  route: string
  status: 'Good Service' | 'Delays' | 'Planned Work'
}

type FilterStatus = 'ALL' | 'GOOD' | 'DISRUPTIONS'

const INITIAL_LINES: SubwayLine[] = [
  { name: '1', color: '#EE352E', textColor: '#FFFFFF', route: 'Van Cortlandt Park - 242 St to South Ferry', status: 'Good Service' },
  { name: '2', color: '#EE352E', textColor: '#FFFFFF', route: 'Wakefield - 241 St to Flatbush Av', status: 'Good Service' },
  { name: '3', color: '#EE352E', textColor: '#FFFFFF', route: 'Harlem - 148 St to New Lots Av', status: 'Delays' },
  { name: 'F', color: '#FF6319', textColor: '#FFFFFF', route: 'Brooklyn Bridge to Jamaica - 179 St (Queens)', status: 'Good Service' },
  { name: 'N', color: '#FCCC0A', textColor: '#000000', route: 'Astoria - Ditmars Blvd to Coney Island', status: 'Good Service' },
  { name: 'Q', color: '#FCCC0A', textColor: '#000000', route: '96 St (Manhattan) to Coney Island', status: 'Planned Work' },
  { name: 'R', color: '#FCCC0A', textColor: '#000000', route: 'Forest Hills - 71 Av to Bay Ridge - 95 St', status: 'Good Service' },
  { name: '7', color: '#B3519E', textColor: '#FFFFFF', route: 'Flushing - Main St to 34 St - Hudson Yards', status: 'Good Service' },
  { name: 'E', color: '#0039A6', textColor: '#FFFFFF', route: 'Jamaica Center to World Trade Center', status: 'Delays' },
]

export default function App() {
  // 1. Initialize state from LocalStorage if available, otherwise use initial defaults
  const [lines, setLines] = useState<SubwayLine[]>(() => {
    const savedLines = localStorage.getItem('mta_subway_lines')
    return savedLines ? JSON.parse(savedLines) : INITIAL_LINES
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString())

  const [showAddForm, setShowAddForm] = useState(false)
  const [newLineName, setNewLineName] = useState('')
  const [newLineRoute, setNewLineRoute] = useState('')
  const [newLineColor, setNewLineColor] = useState('#00933C')
  const [newLineStatus, setNewLineStatus] = useState<'Good Service' | 'Delays' | 'Planned Work'>('Good Service')

  // 2. Persist state updates to LocalStorage whenever `lines` changes
  useEffect(() => {
    localStorage.setItem('mta_subway_lines', JSON.stringify(lines))
  }, [lines])

  const handleSyncData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString())
      setIsRefreshing(false)
    }, 800)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  const handleAddLineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLineName.trim() || !newLineRoute.trim()) return

    const newLine: SubwayLine = {
      name: newLineName.trim().toUpperCase(),
      color: newLineColor,
      textColor: newLineColor === '#FCCC0A' ? '#000000' : '#FFFFFF',
      route: newLineRoute.trim(),
      status: newLineStatus,
    }

    setLines([newLine, ...lines])
    setNewLineName('')
    setNewLineRoute('')
    setShowAddForm(false)
  }

  const handleResetData = () => {
    setLines(INITIAL_LINES)
    localStorage.removeItem('mta_subway_lines')
  }

  const totalLines = lines.length
  const goodServiceCount = lines.filter((l) => l.status === 'Good Service').length
  const delayCount = lines.filter((l) => l.status === 'Delays' || l.status === 'Planned Work').length

  const toggleStatus = (lineName: string) => {
    setLines(
      lines.map((line) => {
        if (line.name === lineName) {
          const newStatus = line.status === 'Good Service' ? 'Delays' : 'Good Service'
          return { ...line, status: newStatus }
        }
        return line
      })
    )
  }

  const filteredLines = lines.filter((line) => {
    const matchesSearch =
      line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.route.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCardFilter =
      activeFilter === 'ALL'
        ? true
        : activeFilter === 'GOOD'
        ? line.status === 'Good Service'
        : line.status === 'Delays' || line.status === 'Planned Work'

    return matchesSearch && matchesCardFilter
  })

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '24px', maxWidth: '650px', margin: '0 auto' }}>
      <header style={{ borderBottom: '3px solid #0039A6', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ color: '#0039A6', margin: 0, fontSize: '28px' }}>MTA Service Status Portal</h1>
            <p style={{ color: '#666', marginTop: '6px', fontSize: '14px', marginBottom: '4px' }}>
              Real-time System Dashboard
            </p>
            <p style={{ color: '#0039A6', fontWeight: 'bold', fontSize: '15px', margin: 0 }}>
              By Mohammed Howlader
            </p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSyncData}
                disabled={isRefreshing}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: isRefreshing ? '#888' : '#0039A6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                }}
              >
                {isRefreshing ? 'Syncing...' : 'Sync Data'}
              </button>
              <button
                onClick={handleResetData}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#444',
                  backgroundColor: '#e0e0e0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#777' }}>
              Last sync: {lastUpdated}
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveFilter('ALL')}
          style={{
            backgroundColor: activeFilter === 'ALL' ? '#d0e1f9' : '#f0f4f9',
            border: activeFilter === 'ALL' ? '2px solid #0039A6' : '1px solid transparent',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0039A6' }}>{totalLines}</div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px', fontWeight: '600' }}>
            All Lines
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('GOOD')}
          style={{
            backgroundColor: activeFilter === 'GOOD' ? '#c3ebd0' : '#e6f4ea',
            border: activeFilter === 'GOOD' ? '2px solid #137333' : '1px solid transparent',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#137333' }}>{goodServiceCount}</div>
          <div style={{ fontSize: '12px', color: '#137333', marginTop: '2px', fontWeight: '600' }}>
            Good Service
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('DISRUPTIONS')}
          style={{
            backgroundColor: activeFilter === 'DISRUPTIONS' ? '#fadedb' : '#fce8e6',
            border: activeFilter === 'DISRUPTIONS' ? '2px solid #c5221f' : '1px solid transparent',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c5221f' }}>{delayCount}</div>
          <div style={{ fontSize: '12px', color: '#c5221f', marginTop: '2px', fontWeight: '600' }}>
            Disruptions
          </div>
        </button>
      </div>

      {/* Action Bar: Add Line Button & Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            width: '100%',
            padding: '12px',
            fontWeight: 'bold',
            fontSize: '15px',
            color: '#fff',
            backgroundColor: showAddForm ? '#666' : '#137333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          {showAddForm ? '✕ Close Form' : '+ Add New Transit Line'}
        </button>

        <input
          type="text"
          placeholder="Search by line (e.g., F, 7) or route..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Add New Line Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddLineSubmit}
          style={{
            backgroundColor: '#f0f4f9',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c0d4f0',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0039A6' }}>
            Add New Transit Line
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Line (e.g., G, L, A)"
              value={newLineName}
              onChange={(e) => setNewLineName(e.target.value)}
              required
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="Route Details (e.g., Court Sq to Church Av)"
              value={newLineRoute}
              onChange={(e) => setNewLineRoute(e.target.value)}
              required
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Color:</label>
            <select
              value={newLineColor}
              onChange={(e) => setNewLineColor(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="#00933C">Green (4, 5, 6, G)</option>
              <option value="#A7A9AC">Gray (L, Shuttle)</option>
              <option value="#0039A6">Blue (A, C, E)</option>
              <option value="#FF6319">Orange (B, D, F, M)</option>
              <option value="#6CBE45">Lime Green (G)</option>
            </select>

            <label style={{ fontSize: '13px', fontWeight: 'bold', marginLeft: '12px' }}>Status:</label>
            <select
              value={newLineStatus}
              onChange={(e) => setNewLineStatus(e.target.value as any)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="Good Service">Good Service</option>
              <option value="Delays">Delays</option>
              <option value="Planned Work">Planned Work</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0039A6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Save Transit Line
          </button>
        </form>
      )}

      {/* Subway Line List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLines.length > 0 ? (
          filteredLines.map((line) => (
            <div
              key={line.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    backgroundColor: line.color,
                    color: line.textColor,
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {line.name}
                </span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{line.name} Line</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{line.route}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    backgroundColor:
                      line.status === 'Good Service'
                        ? '#e6f4ea'
                        : line.status === 'Delays'
                        ? '#fce8e6'
                        : '#fef7e0',
                    color:
                      line.status === 'Good Service'
                        ? '#137333'
                        : line.status === 'Delays'
                        ? '#c5221f'
                        : '#b06000',
                  }}
                >
                  {line.status}
                </span>

                <button
                  onClick={() => toggleStatus(line.name)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Toggle Status
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No subway lines match the selected filter.</p>
        )}
      </div>
    </div>
  )
}