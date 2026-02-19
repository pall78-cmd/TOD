import { DeckState } from '../types';

export type Intensity = 'LIGHT' | 'DEEP' | 'CHAOS';

export interface LevelDeck {
  light: string[];
  deep: string[];
  chaos: string[];
}

export const MASTER_DECK: LevelDeck = {
  light: [
    "TRUTH: Siapa selebriti yang jadi crush pertamamu?",
    "DARE: Kirim stiker teraneh yang kamu punya.",
    "TRUTH: Apa makanan aneh yang diam-diam kamu suka?",
    "DARE: Ganti nama kontak salah satu admin jadi 'Paduka Raja'.",
    "TRUTH: Kapan terakhir kali kamu ngompol? (Jujur!)",
    "DARE: VN nyanyi 'Potong Bebek Angsa' pakai huruf O semua.",
    "TRUTH: Apa kartun masa kecil favoritmu?",
    "DARE: Kirim foto lantai tempatmu berdiri sekarang.",
    "TRUTH: Kalau punya uang 1 Miliar, apa hal pertama yang dibeli?",
    "WILD: Bebas tunjuk siapa saja untuk jawab pertanyaanmu.",
    "CHOICE: Pilih member lain untuk menyanyi (VN) atau kamu yang menyanyi.",
    "CHOICE: Truth untuk dirimu atau Dare untuk orang di sebelahmu (urutan chat).",
    "TRUTH: Siapa disini yang paling sering typo?"
  ],
  deep: [
    "TRUTH: Kapan terakhir kali kamu menangis dan kenapa?",
    "TRUTH: Apa penyesalan terbesarmu tahun ini?",
    "TRUTH: Siapa orang yang paling kamu rindukan saat ini?",
    "TRUTH: Apa hal yang membuatmu insecure secara fisik?",
    "TRUTH: Pernahkah kamu mencintai orang yang tidak bisa kamu miliki?",
    "DARE: Chat mantan/gebetan: 'Aku kangen', SS reaksinya.",
    "DARE: Ceritakan satu rahasia yang belum pernah kamu bilang ke siapapun disini.",
    "TRUTH: Apa ketakutan terbesarmu tentang masa depan?",
    "TRUTH: Jika bisa mengulang waktu, momen apa yang ingin kamu ubah?",
    "WILD: Deep Talk mode. Semua member wajib jawab: Apa arti bahagia bagimu?",
    "TRUTH: Pernahkah kamu merasa tidak dianggap oleh temanmu?",
    "TRUTH: Apa kebohongan terbesar yang pernah kamu katakan pada orang tuamu?",
    "CHOICE: Ceritakan aib masa kecilmu ATAU puji musuh/orang yang kamu benci.",
    "CHOICE: Jawab satu pertanyaan dari member termuda ATAU kirim foto selfie tanpa filter.",
    "TRUTH: Siapa disini yang sifatnya paling mirip denganmu?",
    "TRUTH: Apa mimpi buruk yang pernah jadi kenyataan?",
    "TRUTH: Pernahkah kamu berharap hubungan temanmu berakhir?",
    "CHOICE: Ungkapkan satu rahasia temanmu (anonim) ATAU jujur tentang perasaanmu pada seseorang di grup ini."
  ],
  chaos: [
    "TRUTH: (18+) Apa bagian tubuh pasanganmu yang paling kamu suka?",
    "DARE: (18+) Kirim foto leher/tulang selangkamu sekarang (View Once).",
    "TRUTH: (18+) Sebutkan fantasi terliarmu yang belum pernah terwujud.",
    "CHOICE: (18+) VN desahan manja 5 detik ATAU kirim foto bibir close-up.",
    "TRUTH: (18+) Kapan terakhir kali kamu merasa 'turn on'? Gara-gara apa?",
    "DARE: (18+) Bisikkan kata-kata kotor/nakal lewat VN (View Once).",
    "TRUTH: (18+) Posisi apa yang paling membuatmu penasaran atau favoritmu?",
    "DARE: (18+) Gunakan lidahmu untuk mengeja nama pasanganmu di udara, kirim videonya (View Once).",
    "CHOICE: (18+) Ceritakan mimpi basah terakhirmu ATAU kirim foto paha (aman tapi menggoda).",
    "TRUTH: (18+) Apa hal nakal yang ingin kamu lakukan di tempat umum?",
    "DARE: (18+) Gigit bibir bawahmu se-sexy mungkin, fotokan dan kirim.",
    "TRUTH: (18+) Size matters atau technique matters? Jelaskan alasannya.",
    "DARE: (18+) Kirim VN suara ciuman (muah) yang paling basah.",
    "CHOICE: (18+) Pap outfit tidurmu sekarang ATAU jawab jujur: Suka lampu nyala atau mati?",
    "TRUTH: (18+) Apa fetish teraneh yang kamu punya?",
    "DARE: (18+) Chat pasanganmu: 'Aku nggak pakai apa-apa sekarang', SS reaksinya.",
    "TRUTH: (18+) Suara apa yang paling suka kamu dengar saat intim?",
    "CHOICE: (18+) Dominant atau Submissive? Jelaskan kenapa."
  ]
};

export const initDeck = (): LevelDeck => {
  const saved = localStorage.getItem('oracle_deck_v17_9');
  if (saved) return JSON.parse(saved);
  return { ...MASTER_DECK };
};

export const saveDeck = (deck: LevelDeck) => {
  localStorage.setItem('oracle_deck_v17_9', JSON.stringify(deck));
};

export const resetDeck = (): LevelDeck => {
  localStorage.removeItem('oracle_deck_v17_9');
  return { ...MASTER_DECK };
};

export const drawCard = (currentDeck: LevelDeck, intensity: Intensity): { content: string, newDeck: LevelDeck } => {
  let deckType = currentDeck[intensity.toLowerCase() as keyof LevelDeck];
  
  if (deckType.length === 0) {
    deckType = [...MASTER_DECK[intensity.toLowerCase() as keyof LevelDeck]];
  }

  const idx = Math.floor(Math.random() * deckType.length);
  const rawContent = deckType[idx];
  
  const newTypeDeck = [...deckType];
  newTypeDeck.splice(idx, 1);
  
  const newDeck = { ...currentDeck, [intensity.toLowerCase()]: newTypeDeck };
  saveDeck(newDeck);
  
  return { content: rawContent, newDeck };
};
