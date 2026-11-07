'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Cpu,
  CandlestickChart,
  Crown,
  Sparkles,
  CheckCircle2,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Download,
  Zap,
  ShoppingCart,
  ShieldCheck,
  Clock,
  Send,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCurrencyTL } from '@/lib/format'
import {
  type SectorDefinition,
  SECTOR_DEFINITIONS,
} from '@/config/sectors'

export { type SectorDefinition, SECTOR_DEFINITIONS }


/* =========================================================================
   1. CYBERPUNK SAAS DASHBOARD MOCK TEMPLATE
   ========================================================================= */
export function CyberpunkSaaSTemplate({ isMobile }: { isMobile: boolean }) {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H')
  const [activeMetric, setActiveMetric] = useState<'throughput' | 'latency' | 'mrr'>('throughput')
  const [deployState, setDeployState] = useState<'idle' | 'deploying' | 'success'>('idle')
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const chartData: Record<'1H' | '24H' | '7D' | '30D', number[]> = {
    '1H': [42, 68, 55, 84, 76, 92, 88, 95],
    '24H': [35, 52, 48, 70, 64, 82, 79, 94],
    '7D': [28, 44, 62, 58, 75, 80, 89, 96],
    '30D': [20, 38, 50, 68, 72, 85, 91, 98],
  }

  const nodes = [
    { name: 'Edge-Frankfurt-01', ping: '8ms', load: '64%', status: 'OPTIMAL' },
    { name: 'Edge-Tokyo-04', ping: '14ms', load: '78%', status: 'ACTIVE' },
    { name: 'Edge-Singapore-09', ping: '19ms', load: '52%', status: 'OPTIMAL' },
    { name: 'Edge-Virginia-02', ping: '11ms', load: '83%', status: 'HIGH_LOAD' },
  ]

  function handleDeploy() {
    if (deployState === 'deploying') return
    setDeployState('deploying')
    setTimeout(() => {
      setDeployState('success')
      setTimeout(() => setDeployState('idle'), 3500)
    }, 1200)
  }

  function triggerAction(actionName: string) {
    setActionFeedback(`${actionName} başarıyla tamamlandı! (0.14s)`)
    setTimeout(() => setActionFeedback(null), 3000)
  }

  return (
    <div className="space-y-4 p-4 text-slate-200">
      {/* Top Banner / System Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-neon-cyan" />
          </span>
          <span className="font-mono text-xs font-bold text-white">TERNEON-GRID v4.8</span>
          <span className="rounded bg-neon-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-neon-cyan">
            99.99% KESİNTİSİZLİK
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 text-neon-cyan" />
          <span>Canlı Telemetri: 64 Düğüm Senkron</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
        <div
          onClick={() => setActiveMetric('throughput')}
          className={cn(
            'cursor-pointer rounded-xl border p-3.5 transition-all',
            activeMetric === 'throughput'
              ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-cyan'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
          )}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bant Genişliği</span>
            <Zap className="h-4 w-4 text-neon-cyan" />
          </div>
          <div className="mt-1 font-display text-xl font-bold text-white">148.4 TH/s</div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +14.2% son 24s
          </div>
        </div>

        <div
          onClick={() => setActiveMetric('latency')}
          className={cn(
            'cursor-pointer rounded-xl border p-3.5 transition-all',
            activeMetric === 'latency'
              ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-cyan'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
          )}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Uç Gecikme</span>
            <Clock className="h-4 w-4 text-neon-violet" />
          </div>
          <div className="mt-1 font-display text-xl font-bold text-white">12 ms</div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-400">
            <ArrowDownRight className="h-3 w-3" /> -4ms optimizasyon
          </div>
        </div>

        <div
          onClick={() => setActiveMetric('mrr')}
          className={cn(
            'cursor-pointer rounded-xl border p-3.5 transition-all',
            activeMetric === 'mrr'
              ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-cyan'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
          )}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aylık Gelir (MRR)</span>
            <Sparkles className="h-4 w-4 text-pink-400" />
          </div>
          <div className="mt-1 font-display text-xl font-bold text-white">$84,230</div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +18.6% büyüme
          </div>
        </div>
      </div>

      {/* Interactive Chart Visualizer */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">
              {activeMetric === 'throughput'
                ? 'İşlem Hacmi Akışı'
                : activeMetric === 'latency'
                ? 'Uç Gecikme Analizi'
                : 'Gelir Büyüme Eğrisi'}
            </div>
            <div className="text-[11px] text-slate-400">Gerçek zamanlı küme yanıt oranı</div>
          </div>
          {/* Timeframe selector */}
          <div className="flex gap-1 rounded-lg border border-white/10 bg-slate-900/60 p-1">
            {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'rounded px-2 py-0.5 text-[10px] font-bold transition',
                  timeframe === tf
                    ? 'bg-neon-cyan text-[#070a12]'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="mt-4 flex h-32 items-end justify-between gap-1.5 border-b border-white/10 pb-2">
          {chartData[timeframe].map((val, idx) => (
            <div key={idx} className="group relative flex flex-1 flex-col items-center">
              <span className="absolute -top-6 hidden font-mono text-[10px] text-neon-cyan group-hover:block">
                {val}%
              </span>
              <motion.div
                key={`${timeframe}-${idx}`}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                className={cn(
                  'w-full rounded-t transition-all',
                  idx === chartData[timeframe].length - 1
                    ? 'bg-gradient-to-t from-neon-violet to-neon-cyan shadow-glow-cyan'
                    : 'bg-white/10 hover:bg-neon-cyan/40'
                )}
              />
              <span className="mt-2 text-[9px] text-slate-500">T{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Node Clusters & Glowing Action Buttons */}
      <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
        {/* Node Health List */}
        <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="text-xs font-bold text-white">Aktif Edge Kümeleri</div>
          {nodes.map((node, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-1.5 text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono text-slate-300">{node.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400">{node.ping}</span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[9px] font-bold',
                    node.status === 'HIGH_LOAD'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  )}
                >
                  {node.load}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col justify-between space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="text-xs font-bold text-white">Siber Operasyon Kontrolü</div>
          <div className="space-y-2">
            <button
              onClick={handleDeploy}
              disabled={deployState === 'deploying'}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet py-2.5 text-xs font-bold text-[#070a12] shadow-glow-cyan transition active:scale-95 disabled:opacity-50"
            >
              <Zap className={cn('h-3.5 w-3.5', deployState === 'deploying' && 'animate-spin')} />
              {deployState === 'idle' && 'Deploy Edge Cluster'}
              {deployState === 'deploying' && 'Dağıtılıyor (64 Düğüm)...'}
              {deployState === 'success' && '✓ Küme Başarıyla Güncellendi!'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerAction('Önbellek Temizleme')}
                className="rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-semibold text-slate-300 hover:border-white/20 hover:text-white"
              >
                Flush Redis Cache
              </button>
              <button
                onClick={() => triggerAction('Güvenlik Taraması')}
                className="rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-semibold text-slate-300 hover:border-white/20 hover:text-white"
              >
                Audit Vulnerabilities
              </button>
            </div>
          </div>

          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded bg-emerald-500/20 p-1.5 text-center text-[10px] font-medium text-emerald-300"
            >
              {actionFeedback}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   2. WEB3 / CRYPTO PORTFOLIO MOCK TEMPLATE
   ========================================================================= */
export function Web3CryptoTemplate({ isMobile }: { isMobile: boolean }) {
  const [walletConnected, setWalletConnected] = useState(true)
  const [payAmount, setPayAmount] = useState('1.5')
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'SOL' | 'NEON' | 'BTC'>('ETH')
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapFeedback, setSwapFeedback] = useState<string | null>(null)

  const tokens = [
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: '$3,420.50', change: '+5.4%', balance: '8.42 ETH', val: '$28,800.61' },
    { id: 'SOL', name: 'Solana', symbol: 'SOL', price: '$184.20', change: '+12.8%', balance: '45.0 SOL', val: '$8,289.00' },
    { id: 'NEON', name: 'Terneon Cyber', symbol: 'NEON', price: '$42.10', change: '+24.6%', balance: '240.0 NEON', val: '$10,104.00' },
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: '$91,400.00', change: '+3.1%', balance: '0.19 BTC', val: '$17,366.00' },
  ]

  const tokenRate: Record<string, number> = {
    ETH: 81.2,
    SOL: 4.37,
    NEON: 1.0,
    BTC: 2170.0,
  }

  const calculatedReceive = (parseFloat(payAmount || '0') * (tokenRate[selectedToken] || 1)).toFixed(2)

  function handleSwap() {
    setIsSwapping(true)
    setTimeout(() => {
      setIsSwapping(false)
      setSwapFeedback(`İşlem Onaylandı: ${payAmount} ${selectedToken} ➔ ${calculatedReceive} NEON`)
      setTimeout(() => setSwapFeedback(null), 4000)
    }, 1000)
  }

  return (
    <div className="space-y-4 p-4 text-slate-200">
      {/* Wallet Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
        <div>
          <div className="text-[11px] text-slate-400">Toplam Portföy Değeri</div>
          <div className="font-display text-2xl font-black text-white">
            {walletConnected ? '$64,559.61' : '$0.00'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +14.8% son 24 saat
          </div>
        </div>

        <button
          onClick={() => setWalletConnected(!walletConnected)}
          className={cn(
            'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition',
            walletConnected
              ? 'border border-neon-violet/40 bg-neon-violet/10 text-neon-violet'
              : 'bg-gradient-to-r from-neon-cyan to-neon-violet text-[#070a12]'
          )}
        >
          <Wallet className="h-3.5 w-3.5" />
          {walletConnected ? '0x89b1...48b2 ✓' : 'Cüzdan Bağla'}
        </button>
      </div>

      {/* Token List */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300">Varlıklarım & Kurlar</div>
        <div className={cn('grid gap-2', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
          {tokens.map((token) => (
            <div
              key={token.id}
              onClick={() => setSelectedToken(token.id as any)}
              className={cn(
                'cursor-pointer rounded-xl border p-3 transition-all',
                selectedToken === token.id
                  ? 'border-neon-violet bg-neon-violet/10 shadow-glow-violet'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 font-mono text-xs font-bold text-neon-cyan">
                    {token.symbol.slice(0, 3)}
                  </span>
                  <div>
                    <div className="font-semibold text-xs text-white">{token.name}</div>
                    <div className="text-[10px] text-slate-400">{token.balance}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-white">{token.price}</div>
                  <div className="text-[10px] text-emerald-400">{token.change}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Swap Engine */}
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span>Hızlı Çapraz Takas (Swap)</span>
          <span className="rounded bg-neon-violet/20 px-2 py-0.5 text-[10px] font-medium text-neon-violet">
            Gas: 12 Gwei ($0.24)
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {/* Pay Input */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2">
            <div>
              <span className="block text-[10px] text-slate-400">Ödenen</span>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-24 bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
            </div>
            <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs font-bold text-neon-cyan">
              {selectedToken}
            </span>
          </div>

          {/* Receive Output */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2">
            <div>
              <span className="block text-[10px] text-slate-400">Alınacak (Tahmini)</span>
              <div className="font-mono text-sm font-bold text-neon-violet">{calculatedReceive}</div>
            </div>
            <span className="rounded-md bg-neon-violet/20 px-2 py-1 font-mono text-xs font-bold text-neon-violet">
              NEON
            </span>
          </div>

          <button
            onClick={handleSwap}
            disabled={isSwapping || !walletConnected}
            className="focus-ring mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-violet to-neon-cyan py-2.5 text-xs font-bold text-[#070a12] shadow-glow-violet transition active:scale-95 disabled:opacity-50"
          >
            {isSwapping ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {isSwapping ? 'Blokzincir Onayı Bekleniyor...' : 'Simüle Takası Gerçekleştir'}
          </button>

          {swapFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded bg-emerald-500/20 p-2 text-center text-xs font-medium text-emerald-300"
            >
              {swapFeedback}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   3. NEON E-COMMERCE SHOP MOCK TEMPLATE
   ========================================================================= */
interface CartItem {
  id: string
  name: string
  price: number
  qty: number
}

export function NeonECommerceTemplate({ isMobile }: { isMobile: boolean }) {
  const [filter, setFilter] = useState<'All' | 'Cyberware' | 'Wearables' | 'Hardware'>('All')
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'prod-1', name: 'Cyber Goggles MK-IV', price: 4200, qty: 1 },
  ])
  const [showCartDrawer, setShowCartDrawer] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const products = [
    {
      id: 'prod-1',
      name: 'Cyber Goggles MK-IV',
      category: 'Cyberware',
      price: 4200,
      badge: 'HUD Destekli',
      desc: 'Termal gece görüşü ve artırılmış gerçeklik vizörü.',
    },
    {
      id: 'prod-2',
      name: 'Neural Link V2 Band',
      category: 'Hardware',
      price: 8900,
      badge: 'Bestseller',
      desc: 'Doğrudan beyin dalgası okuma ve telemetri kafa bandı.',
    },
    {
      id: 'prod-3',
      name: 'Neon Synth Jacket',
      category: 'Wearables',
      price: 5600,
      badge: 'Işıklı Doku',
      desc: 'Programlanabilir fiber optik neon aydınlatmalı ceket.',
    },
    {
      id: 'prod-4',
      name: 'Quantum Data Drive',
      category: 'Hardware',
      price: 3100,
      badge: '100 TB',
      desc: 'Optik kristal şifreli taşınabilir kuantum bellek.',
    },
  ]

  const filteredProducts = products.filter((p) => filter === 'All' || p.category === filter)

  function addToCart(prod: (typeof products)[0]) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === prod.id)
      if (existing) {
        return prev.map((i) => (i.id === prod.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { id: prod.id, name: prod.name, price: prod.price, qty: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    )
  }

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0)

  function handleCheckout() {
    setOrderPlaced(true)
    setTimeout(() => {
      setCart([])
      setOrderPlaced(false)
      setShowCartDrawer(false)
    }, 2800)
  }

  return (
    <div className="relative space-y-4 p-4 text-slate-200">
      {/* Store Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="font-display text-sm font-black tracking-wider text-neon-cyan">
            NEON CYBERSTORE
          </span>
          <span className="ml-2 text-[10px] text-slate-400">Geleceğin Donanımları</span>
        </div>

        <button
          onClick={() => setShowCartDrawer(!showCartDrawer)}
          className="relative flex items-center gap-1.5 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-xs font-semibold text-neon-cyan transition hover:bg-neon-cyan/20"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Sepet ({cart.reduce((a, b) => a + b.qty, 0)})</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {(['All', 'Cyberware', 'Wearables', 'Hardware'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition',
              filter === cat
                ? 'bg-neon-cyan text-[#070a12]'
                : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition-all hover:border-neon-cyan/30"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-neon-cyan">
                  {p.badge}
                </span>
                <span className="text-[10px] text-slate-500">{p.category}</span>
              </div>
              <h5 className="mt-2 font-display text-sm font-bold text-white">{p.name}</h5>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{p.desc}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-display text-xs font-extrabold text-neon-cyan">
                {formatCurrencyTL(p.price)}
              </span>
              <button
                onClick={() => addToCart(p)}
                className="focus-ring flex items-center gap-1 rounded-lg bg-neon-cyan/15 px-2.5 py-1 text-[11px] font-semibold text-neon-cyan transition hover:bg-neon-cyan hover:text-[#070a12]"
              >
                <Plus className="h-3 w-3" /> Sepete Ekle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer / Modal */}
      <AnimatePresence>
        {showCartDrawer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-neon-cyan/40 bg-slate-950 p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white">Alışveriş Sepeti</span>
              <span className="text-xs text-slate-400">Kargo: Ücretsiz</span>
            </div>

            {cart.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">Sepetiniz boş.</div>
            ) : (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[10px] text-neon-cyan">
                        {formatCurrencyTL(item.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="rounded bg-white/10 p-1 hover:bg-white/20"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                      <span className="font-mono text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="rounded bg-white/10 p-1 hover:bg-white/20"
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Toplam Tutar:</span>
                  <span className="text-neon-cyan">{formatCurrencyTL(subtotal)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={orderPlaced}
                  className="focus-ring mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet py-2 text-xs font-bold text-[#070a12] shadow-glow-cyan"
                >
                  {orderPlaced ? '✓ Siparişiniz Alındı!' : 'Siparişi Tamamla'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =========================================================================
   4. AI CREATIVE AGENCY MOCK TEMPLATE
   ========================================================================= */
export function AiAgencyTemplate({ isMobile }: { isMobile: boolean }) {
  const [prompt, setPrompt] = useState('Cyberpunk Neo-Tokyo rain reflections with neon holographic billboards')
  const [style, setStyle] = useState<'Cyberpunk' | 'Synthwave' | 'Hyperreal' | 'Dark Luxury'>('Cyberpunk')
  const [aspect, setAspect] = useState<'16:9' | '1:1' | '9:16'>('16:9')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [outputReady, setOutputReady] = useState(true)

  const promptPresets = [
    'Cyberpunk Neo-Tokyo rain reflections with neon billboards',
    'Quantum neural network synapse in obsidian darkroom',
    'Holographic haute-couture fashion portrait 8K HDR',
    'Futuristic electric hypercar aerodynamic wind tunnel',
  ]

  function handleGenerate() {
    setIsGenerating(true)
    setProgress(0)
    setOutputReady(false)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setOutputReady(true)
          return 100
        }
        return prev + 25
      })
    }, 250)
  }

  return (
    <div className="space-y-4 p-4 text-slate-200">
      {/* Agency Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="font-display text-sm font-bold text-pink-400">TERNEON SYNTH-AI</span>
          <span className="ml-2 text-[10px] text-slate-400">Kreatif Prompt Stüdyosu</span>
        </div>
        <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-pink-400">
          Model: Diffusion-X 2099
        </span>
      </div>

      {/* Preset Chips */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400">Hızlı Şablonlar:</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {promptPresets.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-300 hover:border-pink-500/40 hover:text-white"
            >
              {p.slice(0, 32)}...
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-3">
        <label className="text-[10px] uppercase tracking-wider text-pink-400 font-semibold">
          Yapay Zeka Promptu
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1 w-full resize-none bg-transparent text-xs text-white outline-none"
        />
      </div>

      {/* Style & Aspect Controls */}
      <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
        <div>
          <span className="text-[10px] text-slate-400">Sanat Tarzı:</span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(['Cyberpunk', 'Synthwave', 'Hyperreal', 'Dark Luxury'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[10px] font-semibold transition',
                  style === s
                    ? 'bg-pink-500 text-white shadow-glow-soft'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400">En-Boy Oranı:</span>
          <div className="mt-1.5 flex gap-1">
            {(['16:9', '1:1', '9:16'] as const).map((asp) => (
              <button
                key={asp}
                onClick={() => setAspect(asp)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[10px] font-semibold transition',
                  aspect === asp ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                )}
              >
                {asp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Action Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-neon-violet py-2.5 text-xs font-bold text-white shadow-glow-soft transition active:scale-95 disabled:opacity-50"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {isGenerating ? `Nöral Sentez Yapılıyor (${progress}%)...` : 'Görseli Üret'}
      </button>

      {/* Output Showcase Card */}
      {outputReady && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-950/30 via-slate-900/60 to-[#070a12] p-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-semibold text-white">Sentezlenen Eser Çıktısı</span>
            <span className="font-mono text-[10px] text-pink-400">4096x2304 · Seed #894211</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-300 font-medium">"{prompt}"</div>
              <div className="mt-1 flex gap-2 text-[10px] text-slate-400">
                <span>Stil: {style}</span>
                <span>Oran: {aspect}</span>
                <span>Süre: 1.2s</span>
              </div>
            </div>
            <button className="flex items-center gap-1 rounded-lg bg-pink-500/20 px-2.5 py-1.5 text-[10px] font-bold text-pink-300 hover:bg-pink-500 hover:text-white">
              <Download className="h-3 w-3" /> İndir
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* =========================================================================
   5. FINTECH TERMINAL MOCK TEMPLATE
   ========================================================================= */
export function FintechTerminalTemplate({ isMobile }: { isMobile: boolean }) {
  const [pair, setPair] = useState<'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT'>('BTC/USDT')
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [orderAmount, setOrderAmount] = useState('0.25')
  const [tradeConfirmation, setTradeConfirmation] = useState<string | null>(null)

  const livePrices = {
    'BTC/USDT': { price: '91,420.50', change: '+4.82%', high: '92,800', low: '89,200', vol: '$1.84B' },
    'ETH/USDT': { price: '3,420.80', change: '+6.14%', high: '3,490', low: '3,280', vol: '$840M' },
    'SOL/USDT': { price: '184.40', change: '+11.20%', high: '192', low: '172', vol: '$420M' },
  }

  const current = livePrices[pair]

  const candlesticks = [
    { open: 30, close: 65, high: 75, low: 25, isUp: true },
    { open: 65, close: 50, high: 70, low: 45, isUp: false },
    { open: 50, close: 78, high: 82, low: 48, isUp: true },
    { open: 78, close: 72, high: 84, low: 68, isUp: false },
    { open: 72, close: 88, high: 92, low: 70, isUp: true },
    { open: 88, close: 95, high: 98, low: 84, isUp: true },
    { open: 95, close: 89, high: 99, low: 86, isUp: false },
    { open: 89, close: 96, high: 100, low: 88, isUp: true },
  ]

  const orderBookAsks = [
    { price: '91,440', size: '1.42', depth: '75%' },
    { price: '91,435', size: '0.85', depth: '55%' },
    { price: '91,425', size: '0.34', depth: '25%' },
  ]

  const orderBookBids = [
    { price: '91,415', size: '0.92', depth: '40%' },
    { price: '91,410', size: '1.80', depth: '85%' },
    { price: '91,400', size: '2.45', depth: '95%' },
  ]

  function handleTrade() {
    setTradeConfirmation(`${side === 'BUY' ? 'ALIŞ' : 'SATIŞ'} Emri Gerçekleşti: ${orderAmount} ${pair.split('/')[0]}`)
    setTimeout(() => setTradeConfirmation(null), 3000)
  }

  return (
    <div className="space-y-4 p-4 text-slate-200">
      {/* Terminal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            {(['BTC/USDT', 'ETH/USDT', 'SOL/USDT'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPair(p)}
                className={cn(
                  'rounded px-2 py-0.5 text-[10px] font-bold transition',
                  pair === p ? 'bg-emerald-500 text-[#070a12]' : 'text-slate-400 hover:text-white'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div>
            <span className="font-mono text-base font-black text-white">{current.price}</span>
            <span className="ml-2 font-mono text-[11px] text-emerald-400">{current.change}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span>Y: {current.high}</span>
          <span>D: {current.low}</span>
          <span>Hacim: {current.vol}</span>
        </div>
      </div>

      {/* Candlestick Visualization */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Mum Grafik (1 Dakikalık Akış)
        </div>
        <div className="mt-3 flex h-28 items-end justify-between gap-2 border-b border-white/10 pb-2">
          {candlesticks.map((c, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end h-full">
              {/* Wick */}
              <div
                className={cn('w-0.5', c.isUp ? 'bg-emerald-400' : 'bg-rose-400')}
                style={{ height: `${c.high - c.low}%` }}
              />
              {/* Candle Body */}
              <div
                className={cn('w-full rounded-xs', c.isUp ? 'bg-emerald-500' : 'bg-rose-500')}
                style={{ height: `${Math.abs(c.close - c.open)}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Order Book & Fast Trade Box */}
      <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
        {/* Order Book Ladder */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <div className="text-xs font-bold text-white">Canlı Derinlik Tablosu</div>
          <div className="mt-2 space-y-1 font-mono text-[10px]">
            {/* Asks (Sell Orders) */}
            {orderBookAsks.map((ask, i) => (
              <div key={i} className="relative flex justify-between px-1 text-rose-400">
                <div
                  className="absolute inset-y-0 right-0 bg-rose-500/10"
                  style={{ width: ask.depth }}
                />
                <span className="relative z-10">{ask.price}</span>
                <span className="relative z-10">{ask.size}</span>
              </div>
            ))}
            <div className="border-y border-white/10 py-0.5 text-center font-bold text-white">
              --- {current.price} ---
            </div>
            {/* Bids (Buy Orders) */}
            {orderBookBids.map((bid, i) => (
              <div key={i} className="relative flex justify-between px-1 text-emerald-400">
                <div
                  className="absolute inset-y-0 right-0 bg-emerald-500/10"
                  style={{ width: bid.depth }}
                />
                <span className="relative z-10">{bid.price}</span>
                <span className="relative z-10">{bid.size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Execution */}
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-3">
          <div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1">
              <button
                onClick={() => setSide('BUY')}
                className={cn(
                  'rounded py-1 text-xs font-bold transition',
                  side === 'BUY' ? 'bg-emerald-500 text-[#070a12]' : 'text-slate-400'
                )}
              >
                AL (BUY)
              </button>
              <button
                onClick={() => setSide('SELL')}
                className={cn(
                  'rounded py-1 text-xs font-bold transition',
                  side === 'SELL' ? 'bg-rose-500 text-white' : 'text-slate-400'
                )}
              >
                SAT (SELL)
              </button>
            </div>

            <div className="mt-3">
              <span className="text-[10px] text-slate-400">Miktar</span>
              <input
                type="number"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              onClick={handleTrade}
              className={cn(
                'focus-ring w-full rounded-xl py-2 text-xs font-bold transition active:scale-95',
                side === 'BUY'
                  ? 'bg-emerald-500 text-[#070a12] shadow-glow-soft'
                  : 'bg-rose-500 text-white'
              )}
            >
              Piyasa Emri Gönder
            </button>

            {tradeConfirmation && (
              <motion.div
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded bg-emerald-500/20 p-1.5 text-center text-[10px] font-semibold text-emerald-300"
              >
                {tradeConfirmation}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   6. LUXURY BRAND CONCEPT MOCK TEMPLATE
   ========================================================================= */
export function LuxuryBrandTemplate({ isMobile }: { isMobile: boolean }) {
  const [collection, setCollection] = useState<'Obsidian' | 'Cyber Couture' | 'Velvet'>('Obsidian')
  const [activeLook, setActiveLook] = useState(0)
  const [bookingModal, setBookingModal] = useState(false)
  const [booked, setBooked] = useState(false)

  const looks = [
    {
      title: 'Look 01 — Obsidian Cyber Trench',
      sub: 'Atelier Özel Dikim',
      desc: 'Karbon elyaf takviyeli kaşmir ve gizli neon dikiş astarı ile sınırlı üretim 50 adet.',
      price: '€4,800',
      availability: 'Ön Siparişe Açık',
    },
    {
      title: 'Look 02 — Platinum Silk Kimono',
      sub: 'Maison Terneon Haute Couture',
      desc: 'El dokuması ışıl ışıl optik ipek kumaş, manyetik titanyum toka detayları.',
      price: '€6,200',
      availability: 'Sadece Davetiye ile',
    },
    {
      title: 'Look 03 — Chrono Sovereign Watch',
      sub: 'Haute Horlogerie',
      desc: 'Safir kristal cam, kuantum çekirdek mekanizması ve obsidyen seramik kasa.',
      price: '€12,500',
      availability: 'Sınırlı 12 Parça',
    },
  ]

  const current = looks[activeLook]

  function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBooked(true)
    setTimeout(() => {
      setBooked(false)
      setBookingModal(false)
    }, 2500)
  }

  return (
    <div className="space-y-4 p-4 text-slate-200">
      {/* Luxury Maison Header */}
      <div className="border-b border-amber-500/20 pb-3 text-center">
        <span className="font-serif text-sm tracking-[0.25em] text-amber-300 uppercase">
          Maison Terneon · Paris · Istanbul
        </span>
        <div className="text-[10px] tracking-widest text-slate-400 uppercase mt-0.5">
          Haute Couture & Private Atelier
        </div>
      </div>

      {/* Collection Switcher */}
      <div className="flex justify-center gap-2">
        {(['Obsidian', 'Cyber Couture', 'Velvet'] as const).map((col) => (
          <button
            key={col}
            onClick={() => setCollection(col)}
            className={cn(
              'rounded-full px-3 py-1 font-serif text-[11px] tracking-wider transition',
              collection === col
                ? 'border border-amber-400 bg-amber-500/20 text-amber-300'
                : 'border border-white/10 text-slate-400 hover:text-white'
            )}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Editorial Lookbook Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-[#070a12] to-black p-5 text-center">
        <span className="text-[10px] tracking-widest text-amber-400 uppercase font-serif">
          {current.sub}
        </span>
        <h4 className="mt-2 font-serif text-lg font-light tracking-wide text-white">
          {current.title}
        </h4>
        <p className="mx-auto mt-2 max-w-sm text-xs text-slate-300 font-light leading-relaxed">
          {current.desc}
        </p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <span className="font-serif text-sm font-semibold text-amber-300">{current.price}</span>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-slate-400">
            {current.availability}
          </span>
        </div>

        {/* Look Switcher Dots */}
        <div className="mt-5 flex justify-center gap-2">
          {looks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveLook(idx)}
              className={cn(
                'h-2 rounded-full transition-all',
                activeLook === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/20'
              )}
            />
          ))}
        </div>

        <button
          onClick={() => setBookingModal(true)}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/15 px-6 py-2 text-xs font-serif tracking-widest text-amber-200 uppercase transition hover:bg-amber-500 hover:text-[#070a12]"
        >
          <Crown className="h-3.5 w-3.5" />
          Özel Randevu Talep Et
        </button>
      </div>

      {/* Private Fitting Modal */}
      <AnimatePresence>
        {bookingModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-amber-500/40 bg-slate-950 p-4 text-center shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-serif text-xs text-amber-300">VIP Atelier Randevusu</span>
              <button
                onClick={() => setBookingModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {booked ? (
              <div className="py-6">
                <CheckCircle2 className="mx-auto h-8 w-8 text-amber-400" />
                <div className="mt-2 font-serif text-sm text-white">VIP Davetiyeniz Ayrıldı</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Concierge ekibimiz 24 saat içinde özel davetiyenizi ulaştıracaktır.
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-3 space-y-2 text-left">
                <div>
                  <label className="text-[10px] text-slate-400">Ad Soyad</label>
                  <input
                    required
                    placeholder="Sayın Misafirimiz"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Boutique Tercihi</label>
                  <select className="w-full rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none">
                    <option>Nişantaşı Atelier — Istanbul</option>
                    <option>Rue Saint-Honoré — Paris</option>
                    <option>Ginza Sovereign — Tokyo</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="focus-ring mt-2 w-full rounded-xl bg-amber-400 py-2 text-xs font-serif font-bold text-[#070a12] uppercase tracking-wider"
                >
                  Rezervasyonu Tamamla
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
