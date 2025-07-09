import { prisma } from './prisma';

export interface PlanLimitleri {
  maksMenu: number;
  maksDanisan: number;
  icerikUreticisi: boolean;
  aiMenuSiniri: number;
}

export const PLAN_LIMITLERI: Record<string, PlanLimitleri> = {
  ucretsiz: {
    maksMenu: 5,
    maksDanisan: 3,
    icerikUreticisi: false,
    aiMenuSiniri: 5
  },
  temel: {
    maksMenu: 20,
    maksDanisan: 10,
    icerikUreticisi: true,
    aiMenuSiniri: 20
  },
  premium: {
    maksMenu: -1, // -1 = sınırsız
    maksDanisan: -1,
    icerikUreticisi: true,
    aiMenuSiniri: -1
  }
};

export async function kullaniciPlaniniAl(diyetisyenId: string) {
  const abonelik = await prisma.abonelik.findUnique({
    where: { diyetisyenId }
  });

  if (!abonelik || !abonelik.aktif) {
    return {
      plan: 'ucretsiz' as const,
      limitler: PLAN_LIMITLERI.ucretsiz,
      abonelik: null
    };
  }

  // Plan süresini kontrol et
  const now = new Date();
  if (abonelik.bitis && abonelik.bitis < now) {
    // Abonelik süresi dolmuş, ücretsiz plana geç
    await prisma.abonelik.update({
      where: { id: abonelik.id },
      data: { 
        plan: 'ucretsiz',
        aktif: false,
        maksMenu: PLAN_LIMITLERI.ucretsiz.maksMenu,
        maksDanisan: PLAN_LIMITLERI.ucretsiz.maksDanisan
      }
    });

    return {
      plan: 'ucretsiz' as const,
      limitler: PLAN_LIMITLERI.ucretsiz,
      abonelik
    };
  }

  return {
    plan: abonelik.plan as keyof typeof PLAN_LIMITLERI,
    limitler: PLAN_LIMITLERI[abonelik.plan] || PLAN_LIMITLERI.ucretsiz,
    abonelik
  };
}

export async function kullaniciMenuSayisiniAl(diyetisyenId: string) {
  const menuSayisi = await prisma.menu.count({
    where: { diyetisyenId }
  });
  return menuSayisi;
}

export async function kullaniciDanisanSayisiniAl(diyetisyenId: string) {
  const danisanSayisi = await prisma.danisan.count({
    where: { diyetisyenId }
  });
  return danisanSayisi;
}

export async function menuOlusturabilirMi(diyetisyenId: string) {
  const { limitler } = await kullaniciPlaniniAl(diyetisyenId);
  const mevcutMenuSayisi = await kullaniciMenuSayisiniAl(diyetisyenId);
  
  // -1 sınırsız demek
  if (limitler.maksMenu === -1) return { olusturabilir: true, limit: -1, mevcut: mevcutMenuSayisi };
  
  return {
    olusturabilir: mevcutMenuSayisi < limitler.maksMenu,
    limit: limitler.maksMenu,
    mevcut: mevcutMenuSayisi
  };
}

export async function danisanEkleyebilirMi(diyetisyenId: string) {
  const { limitler } = await kullaniciPlaniniAl(diyetisyenId);
  const mevcutDanisanSayisi = await kullaniciDanisanSayisiniAl(diyetisyenId);
  
  // -1 sınırsız demek
  if (limitler.maksDanisan === -1) return { ekleyebilir: true, limit: -1, mevcut: mevcutDanisanSayisi };
  
  return {
    ekleyebilir: mevcutDanisanSayisi < limitler.maksDanisan,
    limit: limitler.maksDanisan,
    mevcut: mevcutDanisanSayisi
  };
}

export async function icerikUreticisiKullanabilirMi(diyetisyenId: string) {
  const { limitler } = await kullaniciPlaniniAl(diyetisyenId);
  return limitler.icerikUreticisi;
}

export async function varsayilanAbonelikOlustur(diyetisyenId: string) {
  const mevcutAbonelik = await prisma.abonelik.findUnique({
    where: { diyetisyenId }
  });

  if (mevcutAbonelik) {
    return mevcutAbonelik;
  }

  const yeniAbonelik = await prisma.abonelik.create({
    data: {
      diyetisyenId,
      plan: 'ucretsiz',
      baslangic: new Date(),
      bitis: null, // Ücretsiz planın süresi yok
      aktif: true,
      maksDanisan: PLAN_LIMITLERI.ucretsiz.maksDanisan,
      maksMenu: PLAN_LIMITLERI.ucretsiz.maksMenu
    }
  });

  return yeniAbonelik;
}

export async function planYukselt(diyetisyenId: string, yeniPlan: keyof typeof PLAN_LIMITLERI, sureDays?: number) {
  const limitler = PLAN_LIMITLERI[yeniPlan];
  const baslangic = new Date();
  const bitis = sureDays ? new Date(Date.now() + sureDays * 24 * 60 * 60 * 1000) : null;

  const abonelik = await prisma.abonelik.upsert({
    where: { diyetisyenId },
    update: {
      plan: yeniPlan,
      baslangic,
      bitis,
      aktif: true,
      maksDanisan: limitler.maksDanisan === -1 ? 999999 : limitler.maksDanisan,
      maksMenu: limitler.maksMenu === -1 ? 999999 : limitler.maksMenu
    },
    create: {
      diyetisyenId,
      plan: yeniPlan,
      baslangic,
      bitis,
      aktif: true,
      maksDanisan: limitler.maksDanisan === -1 ? 999999 : limitler.maksDanisan,
      maksMenu: limitler.maksMenu === -1 ? 999999 : limitler.maksMenu
    }
  });

  return abonelik;
}
