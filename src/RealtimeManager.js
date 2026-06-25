export class RealtimeManager {
  constructor(router, config = {}) {
    this._router = router
    this._enabled = config.enabled || false
    this._mode = config.mode || 'sse'
    this._interval = config.interval || 2000
    this._url = config.url || '/__realtime'
    this._destroyed = false
    this._timer = null
    this._eventSource = null
    this._ws = null
    this._onChange = config.onChange || null
  }

  start() {
    if (!this._enabled || this._destroyed) return
    if (this._mode === 'sse') this._startSSE()
    else if (this._mode === 'websocket') this._startWS()
    else this._startPolling()
  }

  _startSSE() {
    try {
      this._eventSource = new EventSource(this._url)
      this._eventSource.addEventListener('change', (event) => {
        if (this._destroyed) return
        try { this._handleUpdate(JSON.parse(event.data)) }
        catch { this._handleUpdate({}) }
      })
      this._eventSource.onerror = () => {
        if (this._destroyed) return
        this._eventSource.close()
        setTimeout(() => { if (!this._destroyed) this._startSSE() }, 3000)
      }
    } catch {}
  }

  _startPolling() {
    this._poll()
  }

  async _poll() {
    if (this._destroyed) return
    try {
      const res = await fetch(this._url)
      if (res.ok) {
        const data = await res.json()
        if (data.changed) this._handleUpdate(data)
      }
    } catch {}
    if (!this._destroyed) {
      this._timer = setTimeout(() => this._poll(), this._interval)
    }
  }

  _startWS() {
    try {
      this._ws = new WebSocket(this._url)
      this._ws.onmessage = (event) => {
        if (this._destroyed) return
        try { this._handleUpdate(JSON.parse(event.data)) }
        catch { this._handleUpdate({}) }
      }
      this._ws.onclose = () => {
        if (this._destroyed) return
        setTimeout(() => { if (!this._destroyed) this._startWS() }, 3000)
      }
    } catch {}
  }

  _handleUpdate(data) {
    if (this._destroyed || !this._router._started) return
    if (this._onChange) {
      this._onChange(data, this._router)
      return
    }
    if (data.path && data.path !== this._router._pathname) return
    this._router.clearCache()
    this._router.reload()
  }

  destroy() {
    this._destroyed = true
    if (this._timer) { clearTimeout(this._timer); this._timer = null }
    if (this._eventSource) { this._eventSource.close(); this._eventSource = null }
    if (this._ws) { this._ws.close(); this._ws = null }
  }
}
