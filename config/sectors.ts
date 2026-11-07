export interface SectorDefinition {
  id: string
  number: number
  name: string
  shortName: string
  tag: string
  accentColor: string
  badge: string
  description: string
}

export const SECTOR_DEFINITIONS: SectorDefinition[] = [
  {
    id: 'cyberpunk-saas',
    number: 1,
    name: 'SaaS Analytics & Cyberpunk SaaS Dashboard',
    shortName: 'SaaS Analytics',
    tag: 'Analytics & Cloud',
    accentColor: '#22d3ee',
    badge: 'Canlı Telemetri & Düğüm Dağıtımı',
    description: 'Yüksek bant genişlikli edge sunucu analitiği, interaktif metrik grafikleri ve anlık küme operasyonları.',
  },
  {
    id: 'web3-crypto',
    number: 2,
    name: 'FinTech / DeFi & Web3 / Crypto Portfolio',
    shortName: 'FinTech / DeFi',
    tag: 'DeFi & Varlık',
    accentColor: '#a855f7',
    badge: 'Cüzdan & Token Swap Motoru',
    description: 'Çok zincirli token portföyü, canlı varlık kartları ve anlık swap hesaplama simülasyonu.',
  },
  {
    id: 'neon-ecommerce',
    number: 3,
    name: 'E-Commerce & Neon E-Commerce Shop',
    shortName: 'E-Commerce',
    tag: 'Siber Mağaza & Sepet',
    accentColor: '#38bdf8',
    badge: 'Canlı Sepet & Siber Donanım',
    description: 'Neon donanım kataloğu, anlık sepet ekleme, dinamik toplam ve sipariş onay akışı.',
  },
  {
    id: 'ai-agency',
    number: 4,
    name: 'AI Creative Studio & AI Creative Agency',
    shortName: 'AI Creative Studio',
    tag: 'Yapay Zeka Stüdyosu',
    accentColor: '#ec4899',
    badge: 'İnteraktif Prompt Simülatörü',
    description: 'Yapay zeka prompt oluşturucu, stil seçimi, canlı üretim ilerleme çubuğu ve çıktı kartı.',
  },
  {
    id: 'fintech-terminal',
    number: 5,
    name: 'Cyberpunk Gaming & Fintech Terminal',
    shortName: 'Cyberpunk Gaming',
    tag: 'Yüksek Hızlı Borsa & Oyun',
    accentColor: '#10b981',
    badge: 'Canlı Mum Grafik & Derinlik Tablosu',
    description: 'Gerçek zamanlı mum grafiği, emir defteri derinlik kademeleri ve hızlı al-sat simülasyonu.',
  },
  {
    id: 'luxury-concept',
    number: 6,
    name: 'Luxury Real Estate & Luxury Brand Concept',
    shortName: 'Luxury Real Estate',
    tag: 'Lüks Emlak & Haute Atelier',
    accentColor: '#f59e0b',
    badge: 'Obsidian Atelier & VIP Randevu',
    description: 'Karanlık lüks rezidans ve moda vitrini, editoryal lookbook koleksiyon seçimi ve VIP randevu rezervasyonu.',
  },
]
