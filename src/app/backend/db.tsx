import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "./supabaseClient";

export type Role = "customer" | "business" | "designer" | "contractor" | "admin";
export type Unit = "sqm" | "pieces";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  provider: string;
  createdAt: number;
}

export type BusinessStatus = "Draft" | "Submitted" | "Under Review" | "More Information Required" | "Verified" | "Rejected" | "Suspended";

export interface Business {
  id: string;
  ownerId: string;
  legalName: string;
  publicName: string;
  representative: string;
  email: string;
  phone: string;
  governorate: string;
  serviceAreas: string[];
  companyType: string;
  crNumber: string;
  taxNumber: string;
  brands: string[];
  categories: string[];
  productIds: string[];
  deliveryCapacityM2: number;
  minOrderM2: number;
  status: BusinessStatus;
  rating: number;
  createdAt: number;
}

export type RequestStatus =
  | "Request Submitted"
  | "Matching Suppliers"
  | "Awaiting Offers"
  | "Offers Received"
  | "Offer Selected"
  | "Deadline Reached"
  | "No Offers Received"
  | "Admin Assistance Required";

export interface QuoteRequest {
  id: string;
  customerId: string;
  productId: string;
  variantLabel: string;
  quantity: number;
  unit: Unit;
  governorate: string;
  destination: string;
  deliveryDate: string;
  projectType: string;
  phased: boolean;
  notes: string;
  status: RequestStatus;
  createdAt: number;
  deadlineAt: number;
  matchedBusinessIds: string[];
  acceptedOfferId?: string;
  requestItemId?: string;
}

export interface Offer {
  id: string;
  requestId: string;
  businessId: string;
  exactProduct: boolean;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  shipping: number;
  taxRate: number;
  availability: string;
  prepDays: number;
  deliveryDays: number;
  paymentTerms: string;
  notes: string;
  expiresAt: number;
  status: "submitted" | "accepted" | "not-selected" | "expired";
  createdAt: number;
}

export interface Order {
  id: string;
  requestId: string;
  offerId: string;
  customerId: string;
  businessId: string;
  total: number;
  status: "Pending Payment" | "Paid" | "Preparing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "None" | "Sandbox Authorized" | "Sandbox Failed";
  createdAt: number;
}

export interface Message {
  id: string;
  to: string;
  scope: "customer" | "business" | "admin";
  kind: string;
  title: string;
  body: string;
  requestId?: string;
  orderId?: string;
  read: boolean;
  createdAt: number;
}

export interface Plan {
  id: string;
  audience: "customer" | "business";
  name: string;
  monthly: number;
  annual: number;
  trialDays: number;
  features: string[];
  activeRequests: number;
  offerLimit: number;
  hdRenders: number;
  teamMembers: number;
  featuredEligible: boolean;
}

export interface Subscription {
  userId: string;
  planId: string;
  interval: "monthly" | "annual";
  status: "active" | "cancelled" | "payment-failed";
  startedAt: number;
  renewsAt: number;
}

export type PaymentMethodKey = "card" | "fawry" | "wallet" | "applepay" | "bank";

export interface PaymentMethodConfig {
  key: PaymentMethodKey;
  provider: string;
  enabled: boolean;
  mode: "sandbox" | "production";
  merchantConfigured: boolean;
  webhookOk: boolean;
  lastTest: string | null;
  lastFailure: string | null;
  currency: "EGP";
}

export interface RoomProject {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  photo: string | null;
  dims: { length: number; width: number; height: number; unit: "m" | "cm" | "mm" };
  surfaces: { id: string; label: string; productId: string | null; estM2: number }[];
}

export interface AuditEntry {
  id: string;
  at: number;
  actor: string;
  action: string;
  detail: string;
}

interface DB {
  users: User[];
  businesses: Business[];
  requests: QuoteRequest[];
  offers: Offer[];
  orders: Order[];
  messages: Message[];
  plans: Plan[];
  subscriptions: Subscription[];
  payments: PaymentMethodConfig[];
  roomProjects: RoomProject[];
  audit: AuditEntry[];
  sessionUserId: string | null;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: "plan_cust_free",
    audience: "customer",
    name: "Explorer",
    monthly: 0,
    annual: 0,
    trialDays: 0,
    features: ["Browse 470+ architectural surfaces", "Up to 3 Best-Price quote requests", "Interactive 2D room surface simulator", "Download PDF catalogs", "Bilingual Arabic & English"],
    activeRequests: 3,
    offerLimit: 5,
    hdRenders: 3,
    teamMembers: 1,
    featuredEligible: false,
  },
  {
    id: "plan_cust_pro",
    audience: "customer",
    name: "Homeowner Pro",
    monthly: 199,
    annual: 1990,
    trialDays: 14,
    features: ["Unlimited quote requests", "Direct matching with certified Egyptian suppliers", "Unlimited saved room visualizer projects", "Export bill of quantities (BOQ) with m²", "Priority support & delivery coordination"],
    activeRequests: 999,
    offerLimit: 20,
    hdRenders: 20,
    teamMembers: 2,
    featuredEligible: true,
  },
  {
    id: "plan_cust_arch",
    audience: "customer",
    name: "Designer & Architect Studio",
    monthly: 499,
    annual: 4990,
    trialDays: 14,
    features: ["Commercial batch pricing & trade rates", "High-resolution seamless material textures", "Multi-room project management", "Dedicated marketplace concierge manager", "Physical sample box dispatch"],
    activeRequests: 999,
    offerLimit: 50,
    hdRenders: 100,
    teamMembers: 5,
    featuredEligible: true,
  },
  {
    id: "plan_biz_starter",
    audience: "business",
    name: "Starter Supplier",
    monthly: 0,
    annual: 0,
    trialDays: 0,
    features: ["Verified Egyptian supplier directory listing", "Receive up to 5 RFQs monthly", "Submit private binding quotes", "Standard supplier profile page"],
    activeRequests: 5,
    offerLimit: 5,
    hdRenders: 0,
    teamMembers: 1,
    featuredEligible: false,
  },
  {
    id: "plan_biz_pro",
    audience: "business",
    name: "Verified Partner",
    monthly: 799,
    annual: 7990,
    trialDays: 30,
    features: ["Unlimited regional RFQs (Cairo, Giza, Alex)", "Verified Gold Supplier trust badge", "Direct customer messaging & invoice issuing", "Catalogue inventory management", "Acceptance rate & market analytics"],
    activeRequests: 999,
    offerLimit: 999,
    hdRenders: 0,
    teamMembers: 5,
    featuredEligible: true,
  },
  {
    id: "plan_biz_ent",
    audience: "business",
    name: "Enterprise Distributor",
    monthly: 1899,
    annual: 18990,
    trialDays: 30,
    features: ["All Egyptian governorates coverage", "Priority RFQ routing on large project tenders", "Featured showroom banner placement", "Multi-agent team seats & CRM integration", "Custom inventory ERP & webhook integration"],
    activeRequests: 999,
    offerLimit: 999,
    hdRenders: 0,
    teamMembers: 20,
    featuredEligible: true,
  },
];

const DEFAULT_PAYMENTS: PaymentMethodConfig[] = [
  { key: "card", provider: "Paymob / Fawry", enabled: true, mode: "sandbox", merchantConfigured: true, webhookOk: true, lastTest: "2026-10-15T14:30:00Z", lastFailure: null, currency: "EGP" },
  { key: "fawry", provider: "Fawry Pay Egypt", enabled: true, mode: "sandbox", merchantConfigured: true, webhookOk: true, lastTest: "2026-10-15T14:31:00Z", lastFailure: null, currency: "EGP" },
  { key: "wallet", provider: "Vodafone / Orange / e& Cash", enabled: true, mode: "sandbox", merchantConfigured: true, webhookOk: true, lastTest: "2026-10-15T14:32:00Z", lastFailure: null, currency: "EGP" },
  { key: "applepay", provider: "Apple Pay via Paymob", enabled: true, mode: "sandbox", merchantConfigured: true, webhookOk: true, lastTest: "2026-10-15T14:33:00Z", lastFailure: null, currency: "EGP" },
  { key: "bank", provider: "InstaPay / Central Bank of Egypt", enabled: true, mode: "sandbox", merchantConfigured: true, webhookOk: true, lastTest: "2026-10-15T14:34:00Z", lastFailure: null, currency: "EGP" },
];

const DEMO_USERS: User[] = [
  { id: "usr_buyer_demo", name: "Rakan Sherif", email: "buyer@idea.design", phone: "+20 10 1234 5678", role: "customer", provider: "demo", createdAt: 1776000000000 },
  { id: "usr_biz_demo", name: "Ahmed Mozahem", email: "supplier@artceramic.eg", phone: "+20 10 9988 7766", role: "business", provider: "demo", createdAt: 1775000000000 },
  { id: "usr_admin_demo", name: "IDEA Platform Admin", email: "admin@idea.design", phone: "+20 12 0000 9999", role: "admin", provider: "demo", createdAt: 1774000000000 },
];

const DEMO_BUSINESSES: Business[] = [
  {
    id: "biz_artceramic",
    ownerId: "usr_biz_demo",
    legalName: "Art Ceramic Egypt for Manufacturing & Trade",
    publicName: "Art Ceramic Official",
    representative: "Ahmed Mozahem",
    email: "supplier@artceramic.eg",
    phone: "+20 10 9988 7766",
    governorate: "Alexandria",
    serviceAreas: ["Cairo", "Giza", "Alexandria", "Dakahlia", "Sharqia"],
    companyType: "Distributor",
    crNumber: "CR-874291-EG",
    taxNumber: "TR-451-820",
    brands: ["Art Ceramic", "Ceramica Cleopatra"],
    categories: ["Ceramic", "Porcelain"],
    productIds: ["manila-95", "toronto-93", "venezia-96", "106", "146"],
    deliveryCapacityM2: 25000,
    minOrderM2: 15,
    status: "Verified",
    rating: 4.9,
    createdAt: 1775000000000,
  },
  {
    id: "biz_elgawhara",
    ownerId: "usr_biz_1",
    legalName: "El Gawhara Ceramic & Porcelain Co.",
    publicName: "El Gawhara Ceramics",
    representative: "Karim Fahmy",
    email: "sales@elgawhara.eg",
    phone: "+20 2 2450 1100",
    governorate: "Cairo",
    serviceAreas: ["Cairo", "Giza", "Alexandria", "Qalyubia"],
    companyType: "Manufacturer",
    crNumber: "CR-104928-EG",
    taxNumber: "TR-893-412",
    brands: ["El Gawhara"],
    categories: ["Ceramic", "Porcelain"],
    productIds: ["32", "42", "48", "53"],
    deliveryCapacityM2: 60000,
    minOrderM2: 25,
    status: "Verified",
    rating: 4.8,
    createdAt: 1774500000000,
  },
  {
    id: "biz_cleopatra",
    ownerId: "usr_biz_2",
    legalName: "Cleopatra Surface Solutions SAE",
    publicName: "Cleopatra Surfaces",
    representative: "Sherif Mansour",
    email: "info@cleopatragroup.eg",
    phone: "+20 2 3760 9900",
    governorate: "Giza",
    serviceAreas: ["Cairo", "Giza", "Alexandria", "Suez", "Port Said"],
    companyType: "Manufacturer",
    crNumber: "CR-562109-EG",
    taxNumber: "TR-772-901",
    brands: ["Cleopatra"],
    categories: ["Ceramic", "Porcelain", "Sanitary"],
    productIds: ["58", "59", "67"],
    deliveryCapacityM2: 80000,
    minOrderM2: 30,
    status: "Verified",
    rating: 4.7,
    createdAt: 1774000000000,
  },
];

const DEMO_REQUESTS: QuoteRequest[] = [
  {
    id: "req_demo_01",
    customerId: "usr_buyer_demo",
    productId: "manila-95",
    variantLabel: "60x120 cm - Polished",
    quantity: 120,
    unit: "sqm",
    governorate: "Cairo",
    destination: "New Cairo, Fifth Settlement, Villa 42",
    deliveryDate: "2026-11-15",
    projectType: "Residential Villa",
    phased: false,
    notes: "Requires ground floor offloading. Samples inspected in showroom.",
    status: "Offers Received",
    createdAt: Date.now() - 3600000 * 18,
    deadlineAt: Date.now() + 3600000 * 30,
    matchedBusinessIds: ["biz_artceramic", "biz_elgawhara"],
  },
  {
    id: "req_demo_02",
    customerId: "usr_buyer_demo",
    productId: "toronto-93",
    variantLabel: "60x60 cm - Matte",
    quantity: 45,
    unit: "sqm",
    governorate: "Giza",
    destination: "Sheikh Zayed, District 8",
    deliveryDate: "2026-11-20",
    projectType: "Apartment Renovation",
    phased: false,
    notes: "Bathroom floors and master ensuite.",
    status: "Awaiting Offers",
    createdAt: Date.now() - 3600000 * 5,
    deadlineAt: Date.now() + 3600000 * 43,
    matchedBusinessIds: ["biz_artceramic"],
  },
];

const DEMO_OFFERS: Offer[] = [
  {
    id: "off_demo_01",
    requestId: "req_demo_01",
    businessId: "biz_artceramic",
    exactProduct: true,
    quantity: 120,
    unit: "sqm",
    unitPrice: 420,
    shipping: 1200,
    taxRate: 0.14,
    availability: "Immediate in stock (Warehouse 3, Alexandria Desert Rd)",
    prepDays: 2,
    deliveryDays: 3,
    paymentTerms: "50% deposit, balance upon delivery verification",
    notes: "First grade export quality batch. Includes 5% extra tolerance boxes.",
    expiresAt: Date.now() + 86400000 * 5,
    status: "submitted",
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: "off_demo_02",
    requestId: "req_demo_01",
    businessId: "biz_elgawhara",
    exactProduct: true,
    quantity: 120,
    unit: "sqm",
    unitPrice: 435,
    shipping: 900,
    taxRate: 0.14,
    availability: "Available for loading within 48h",
    prepDays: 2,
    deliveryDays: 2,
    paymentTerms: "Full payment via Paymob / Fawry or Bank Transfer",
    notes: "Direct from manufacturer dispatch with certificate of origin.",
    expiresAt: Date.now() + 86400000 * 4,
    status: "submitted",
    createdAt: Date.now() - 3600000 * 8,
  },
];

const DEMO_ORDERS: Order[] = [
  {
    id: "ord_demo_982",
    requestId: "req_demo_archive",
    offerId: "off_demo_archive",
    customerId: "usr_buyer_demo",
    businessId: "biz_artceramic",
    total: 34800,
    status: "Delivered",
    paymentStatus: "Sandbox Authorized",
    createdAt: Date.now() - 86400000 * 14,
  },
];

const DEMO_MESSAGES: Message[] = [
  {
    id: "msg_1",
    to: "usr_buyer_demo",
    scope: "customer",
    kind: "quote_offer",
    title: "New private offer received for Manila 95",
    body: "Art Ceramic Official submitted a competitive offer of 420 EGP/m² for your 120 m² request in New Cairo.",
    requestId: "req_demo_01",
    read: false,
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: "msg_2",
    to: "biz_artceramic",
    scope: "business",
    kind: "new_rfq",
    title: "New RFQ matched in your service area",
    body: "Buyer in Giza requested 45 m² of Toronto 93. Submit a binding quote before the 48-hour deadline.",
    requestId: "req_demo_02",
    read: false,
    createdAt: Date.now() - 3600000 * 5,
  },
];

const DEMO_ROOM_PROJECTS: RoomProject[] = [
  {
    id: "room_demo_01",
    userId: "usr_buyer_demo",
    name: "Master Bathroom Luxury Renovation",
    createdAt: Date.now() - 86400000 * 3,
    photo: null,
    dims: { length: 3.8, width: 2.6, height: 2.8, unit: "m" },
    surfaces: [
      { id: "floor", label: "floor", productId: "manila-95", estM2: 10 },
      { id: "wallA", label: "wallA", productId: "toronto-93", estM2: 11 },
      { id: "wallB", label: "wallB", productId: "venezia-96", estM2: 8 },
    ],
  },
];

const DEMO_AUDIT: AuditEntry[] = [
  { id: "aud_1", at: Date.now() - 86400000 * 3, actor: "System", action: "PLATFORM_INIT", detail: "Marketplace initialized with verified catalogue and payment sandboxes." },
  { id: "aud_2", at: Date.now() - 86400000 * 2, actor: "Admin", action: "VERIFY_SUPPLIER", detail: "Art Ceramic Egypt CR & Tax registration verified." },
  { id: "aud_3", at: Date.now() - 3600000 * 12, actor: "Art Ceramic", action: "SUBMIT_OFFER", detail: "Quote submitted for request req_demo_01 (420 EGP/m²)." },
];

function getInitialDb(): DB {
  try {
    const raw = localStorage.getItem("idea.marketplace.db");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.plans) && parsed.plans.length > 0) {
        return parsed;
      }
    }
  } catch {
    /* fallback to defaults */
  }

  return {
    users: DEMO_USERS,
    businesses: DEMO_BUSINESSES,
    requests: DEMO_REQUESTS,
    offers: DEMO_OFFERS,
    orders: DEMO_ORDERS,
    messages: DEMO_MESSAGES,
    plans: DEFAULT_PLANS,
    subscriptions: [
      {
        userId: "usr_buyer_demo",
        planId: "plan_cust_pro",
        interval: "monthly",
        status: "active",
        startedAt: Date.now() - 86400000 * 10,
        renewsAt: Date.now() + 86400000 * 20,
      },
      {
        userId: "usr_biz_demo",
        planId: "plan_biz_pro",
        interval: "annual",
        status: "active",
        startedAt: Date.now() - 86400000 * 25,
        renewsAt: Date.now() + 86400000 * 340,
      },
    ],
    payments: DEFAULT_PAYMENTS,
    roomProjects: DEMO_ROOM_PROJECTS,
    audit: DEMO_AUDIT,
    sessionUserId: "usr_buyer_demo",
  };
}

export interface Api {
  signIn: (provider: string, role: Role, info?: { name?: string; email?: string; phone?: string }) => User;
  signOut: () => void;
  setRole: (role: Role) => void;
  createBusiness: (b: Partial<Business>) => Business;
  updateBusinessStatus: (id: string, status: BusinessStatus) => void;
  connectProduct: (bizId: string, productId: string) => void;
  createRequest: (r: Omit<QuoteRequest, "id" | "createdAt" | "status" | "deadlineAt" | "matchedBusinessIds" | "customerId">, hours: number) => QuoteRequest;
  submitOffer: (o: Omit<Offer, "id" | "createdAt" | "status">) => Offer;
  acceptOffer: (offerId: string) => Order | null;
  sandboxPay: (orderId: string, ok: boolean) => void;
  subscribe: (planId: string, interval: "monthly" | "annual", paid: boolean) => Subscription | null;
  cancelSubscription: (userId: string) => void;
  updatePlan: (plan: Plan) => void;
  updatePayment: (cfg: PaymentMethodConfig) => void;
  testPayment: (key: PaymentMethodKey) => void;
  markRead: (id: string) => void;
  saveRoomProject: (p: RoomProject) => void;
  deleteRoomProject: (id: string) => void;
  reset: () => void;
}

interface BackendCtx {
  db: DB;
  session: User | null;
  api: Api;
}

const Ctx = createContext<BackendCtx | null>(null);

function dbRole(role: "buyer" | "supplier" | "admin" | string): Role {
  if (role === "buyer" || role === "customer") return "customer";
  if (role === "supplier" || role === "business") return "business";
  if (role === "admin") return "admin";
  if (role === "designer") return "designer";
  if (role === "contractor") return "contractor";
  return "customer";
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(getInitialDb);
  const [session, setSession] = useState<User | null>(() => {
    const initial = getInitialDb();
    return initial.users.find((u) => u.id === initial.sessionUserId) || initial.users[0] || null;
  });

  // Persist local marketplace DB
  useEffect(() => {
    try {
      localStorage.setItem("idea.marketplace.db", JSON.stringify(db));
    } catch {
      /* ignore quota errors */
    }
  }, [db]);

  // Synchronize session state
  useEffect(() => {
    if (session) {
      setDb((old) => ({ ...old, sessionUserId: session.id }));
    }
  }, [session]);

  // Listen to remote Supabase auth if online
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        const supaUser: User = {
          id: u.id,
          name: u.user_metadata?.display_name || u.email?.split("@")[0] || "IDEA Member",
          email: u.email,
          role: dbRole(u.user_metadata?.role || "customer"),
          provider: "supabase",
          createdAt: Date.parse(u.created_at || new Date().toISOString()),
        };
        setSession(supaUser);
        setDb((prev) => ({
          ...prev,
          users: [supaUser, ...prev.users.filter((x) => x.id !== supaUser.id)],
          sessionUserId: supaUser.id,
        }));
      }
    }).catch(() => {
      /* Supabase not reachable in offline/demo mode */
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, current) => {
      if (!current?.user) {
        // preserve local demo user if user didn't explicitly log out
      } else {
        const u = current.user;
        const supaUser: User = {
          id: u.id,
          name: u.user_metadata?.display_name || u.email?.split("@")[0] || "IDEA Member",
          email: u.email,
          role: dbRole(u.user_metadata?.role || "customer"),
          provider: "supabase",
          createdAt: Date.parse(u.created_at || new Date().toISOString()),
        };
        setSession(supaUser);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const api = useMemo<Api>(() => ({
    signIn: (provider, role, info) => {
      const existing = db.users.find((u) => (info?.email && u.email === info.email) || u.role === role);
      if (existing) {
        const updated = { ...existing, role, name: info?.name || existing.name };
        setSession(updated);
        setDb((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === updated.id ? updated : u)),
          sessionUserId: updated.id,
        }));
        return updated;
      }
      const newUser: User = {
        id: `usr_${Math.random().toString(36).slice(2, 9)}`,
        name: info?.name || (role === "admin" ? "IDEA Admin" : role === "business" ? "Supplier Partner" : "Valued Customer"),
        email: info?.email || `${role}@idea.design`,
        phone: info?.phone || "+20 10 0000 0000",
        role,
        provider,
        createdAt: Date.now(),
      };
      setSession(newUser);
      setDb((d) => ({
        ...d,
        users: [newUser, ...d.users],
        sessionUserId: newUser.id,
      }));
      return newUser;
    },

    signOut: () => {
      if (supabase) {
        void supabase.auth.signOut().catch(() => {});
      }
      setSession(null);
      setDb((d) => ({ ...d, sessionUserId: null }));
    },

    setRole: (role) => {
      if (!session) return;
      const updated = { ...session, role };
      setSession(updated);
      setDb((d) => ({
        ...d,
        users: d.users.map((u) => (u.id === updated.id ? updated : u)),
      }));
    },

    createBusiness: (b) => {
      const ownerId = b.ownerId || session?.id || "usr_biz_demo";
      const newBiz: Business = {
        id: `biz_${Math.random().toString(36).slice(2, 8)}`,
        ownerId,
        legalName: b.legalName || "Egyptian Surface Solutions",
        publicName: b.publicName || b.legalName || "Surface Solutions",
        representative: b.representative || session?.name || "Representative",
        email: b.email || session?.email || "info@business.eg",
        phone: b.phone || "+20 10 0000 0000",
        governorate: b.governorate || "Cairo",
        serviceAreas: b.serviceAreas || ["Cairo", "Giza"],
        companyType: b.companyType || "Supplier",
        crNumber: b.crNumber || `CR-${Math.floor(100000 + Math.random() * 900000)}-EG`,
        taxNumber: b.taxNumber || `TR-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
        brands: b.brands || ["Art Ceramic"],
        categories: b.categories || ["Ceramic", "Porcelain"],
        productIds: b.productIds || ["manila-95", "toronto-93"],
        deliveryCapacityM2: b.deliveryCapacityM2 || 15000,
        minOrderM2: b.minOrderM2 || 10,
        status: "Submitted",
        rating: 5.0,
        createdAt: Date.now(),
      };

      setDb((d) => ({
        ...d,
        businesses: [newBiz, ...d.businesses],
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "Supplier", action: "REGISTER_SUPPLIER", detail: `Company ${newBiz.publicName} submitted for verification.` }, ...d.audit],
      }));
      return newBiz;
    },

    updateBusinessStatus: (id, status) => {
      setDb((d) => {
        const b = d.businesses.find((x) => x.id === id);
        return {
          ...d,
          businesses: d.businesses.map((x) => (x.id === id ? { ...x, status } : x)),
          audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: "Admin", action: "UPDATE_SUPPLIER_STATUS", detail: `${b?.publicName || id} status changed to ${status}.` }, ...d.audit],
        };
      });
    },

    connectProduct: (bizId, productId) => {
      setDb((d) => ({
        ...d,
        businesses: d.businesses.map((b) => (b.id === bizId ? { ...b, productIds: [...new Set([...b.productIds, productId])] } : b)),
      }));
    },

    createRequest: (r, hours) => {
      const customerId = session?.id || "usr_buyer_demo";
      const matchedBusinesses = db.businesses.filter((b) => b.status === "Verified");
      const matchedBusinessIds = matchedBusinesses.map((b) => b.id);
      const reqId = `req_${Math.random().toString(36).slice(2, 8)}`;
      const deadlineAt = Date.now() + (hours || 24) * 3600000;

      const newReq: QuoteRequest = {
        ...r,
        id: reqId,
        customerId,
        status: "Request Submitted",
        createdAt: Date.now(),
        deadlineAt,
        matchedBusinessIds,
      };

      // Create notifications
      const notifs: Message[] = [
        {
          id: `msg_${Math.random().toString(36).slice(2, 8)}`,
          to: customerId,
          scope: "customer",
          kind: "rfq_submitted",
          title: "Best-Price request submitted",
          body: `Your request for ${r.quantity} ${r.unit} of ${r.variantLabel || r.productId} has been dispatched to ${matchedBusinesses.length} verified suppliers.`,
          requestId: reqId,
          read: false,
          createdAt: Date.now(),
        },
      ];

      matchedBusinessIds.forEach((bId) => {
        notifs.push({
          id: `msg_${Math.random().toString(36).slice(2, 8)}`,
          to: bId,
          scope: "business",
          kind: "new_rfq",
          title: "New quote request received",
          body: `A buyer in ${r.governorate} requested ${r.quantity} ${r.unit}. Submit an offer within ${hours || 24} hours.`,
          requestId: reqId,
          read: false,
          createdAt: Date.now(),
        });
      });

      setDb((d) => ({
        ...d,
        requests: [newReq, ...d.requests],
        messages: [...notifs, ...d.messages],
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "Buyer", action: "CREATE_RFQ", detail: `Request ${reqId} created for ${r.quantity} ${r.unit}.` }, ...d.audit],
      }));

      // Simulate matching response after a brief moment for realistic marketplace demo
      setTimeout(() => {
        setDb((d) => ({
          ...d,
          requests: d.requests.map((item) => (item.id === reqId ? { ...item, status: "Offers Received" } : item)),
          offers: [
            {
              id: `off_${Math.random().toString(36).slice(2, 8)}`,
              requestId: reqId,
              businessId: matchedBusinessIds[0] || "biz_artceramic",
              exactProduct: true,
              quantity: r.quantity,
              unit: r.unit,
              unitPrice: 395,
              shipping: 850,
              taxRate: 0.14,
              availability: "Available for immediate dispatch",
              prepDays: 2,
              deliveryDays: 2,
              paymentTerms: "50% advance, balance upon delivery",
              notes: "First grade premium surface batch with guaranteed color match.",
              expiresAt: Date.now() + 86400000 * 3,
              status: "submitted",
              createdAt: Date.now(),
            },
            ...d.offers,
          ],
        }));
      }, 1500);

      return newReq;
    },

    submitOffer: (o) => {
      const newOffer: Offer = {
        ...o,
        id: `off_${Math.random().toString(36).slice(2, 8)}`,
        status: "submitted",
        createdAt: Date.now(),
      };

      setDb((d) => {
        const req = d.requests.find((r) => r.id === o.requestId);
        const buyerId = req?.customerId || "usr_buyer_demo";
        const msg: Message = {
          id: `msg_${Math.random().toString(36).slice(2, 8)}`,
          to: buyerId,
          scope: "customer",
          kind: "quote_offer",
          title: "New private offer received",
          body: `A verified supplier submitted an offer of ${o.unitPrice} EGP/${o.unit} for request ${o.requestId}.`,
          requestId: o.requestId,
          read: false,
          createdAt: Date.now(),
        };

        return {
          ...d,
          offers: [newOffer, ...d.offers],
          requests: d.requests.map((r) => (r.id === o.requestId ? { ...r, status: "Offers Received" } : r)),
          messages: [msg, ...d.messages],
          audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "Supplier", action: "SUBMIT_OFFER", detail: `Offer submitted for request ${o.requestId} (${o.unitPrice} EGP).` }, ...d.audit],
        };
      });
      return newOffer;
    },

    acceptOffer: (offerId) => {
      const offer = db.offers.find((o) => o.id === offerId);
      if (!offer) return null;
      const subtotal = offer.unitPrice * offer.quantity;
      const total = subtotal + subtotal * offer.taxRate + offer.shipping;
      const ordId = `ord_${Math.random().toString(36).slice(2, 8)}`;

      const newOrder: Order = {
        id: ordId,
        requestId: offer.requestId,
        offerId,
        customerId: session?.id || "usr_buyer_demo",
        businessId: offer.businessId,
        total,
        status: "Pending Payment",
        paymentStatus: "None",
        createdAt: Date.now(),
      };

      const msgToSupplier: Message = {
        id: `msg_${Math.random().toString(36).slice(2, 8)}`,
        to: offer.businessId,
        scope: "business",
        kind: "offer_accepted",
        title: "Your offer was accepted!",
        body: `Buyer accepted your offer for request ${offer.requestId}. Order ${ordId} created (${total.toLocaleString()} EGP).`,
        orderId: ordId,
        requestId: offer.requestId,
        read: false,
        createdAt: Date.now(),
      };

      setDb((d) => ({
        ...d,
        orders: [newOrder, ...d.orders],
        offers: d.offers.map((o) => (o.id === offerId ? { ...o, status: "accepted" } : o.requestId === offer.requestId ? { ...o, status: "not-selected" } : o)),
        requests: d.requests.map((r) => (r.id === offer.requestId ? { ...r, status: "Offer Selected", acceptedOfferId: offerId } : r)),
        messages: [msgToSupplier, ...d.messages],
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "Buyer", action: "ACCEPT_OFFER", detail: `Offer ${offerId} accepted. Order ${ordId} generated.` }, ...d.audit],
      }));

      return newOrder;
    },

    sandboxPay: (orderId, ok) => {
      setDb((d) => {
        const ord = d.orders.find((o) => o.id === orderId);
        if (!ord) return d;
        const status = ok ? "Preparing" : ord.status;
        const paymentStatus = ok ? "Sandbox Authorized" : "Sandbox Failed";

        const buyerMsg: Message = {
          id: `msg_${Math.random().toString(36).slice(2, 8)}`,
          to: ord.customerId,
          scope: "customer",
          kind: "payment_update",
          title: ok ? "Payment authorized (Sandbox)" : "Payment authorization failed",
          body: ok ? `Payment for order ${ord.id} (${ord.total.toLocaleString()} EGP) was authorized. Your supplier has begun preparation.` : `Payment for order ${ord.id} could not be authorized. Please check your payment details or try an alternate method.`,
          orderId: ord.id,
          read: false,
          createdAt: Date.now(),
        };

        return {
          ...d,
          orders: d.orders.map((o) => (o.id === orderId ? { ...o, status, paymentStatus } : o)),
          messages: [buyerMsg, ...d.messages],
          audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "System", action: "SANDBOX_PAY", detail: `Order ${orderId} payment: ${paymentStatus}.` }, ...d.audit],
        };
      });
    },

    subscribe: (planId, interval, paid) => {
      const userId = session?.id || "usr_buyer_demo";
      const plan = db.plans.find((p) => p.id === planId);
      if (!plan) return null;

      const sub: Subscription = {
        userId,
        planId,
        interval,
        status: paid ? "active" : "payment-failed",
        startedAt: Date.now(),
        renewsAt: Date.now() + (interval === "annual" ? 365 : 30) * 86400000,
      };

      setDb((d) => ({
        ...d,
        subscriptions: [sub, ...d.subscriptions.filter((s) => s.userId !== userId)],
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "User", action: "SUBSCRIBE_PLAN", detail: `Subscribed to ${plan.name} (${interval}).` }, ...d.audit],
      }));
      return sub;
    },

    cancelSubscription: (userId) => {
      setDb((d) => ({
        ...d,
        subscriptions: d.subscriptions.map((s) => (s.userId === userId ? { ...s, status: "cancelled" } : s)),
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "User", action: "CANCEL_SUB", detail: `Subscription cancelled for user ${userId}.` }, ...d.audit],
      }));
    },

    updatePlan: (plan) => {
      setDb((d) => ({
        ...d,
        plans: d.plans.map((p) => (p.id === plan.id ? plan : p)),
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: "Admin", action: "UPDATE_PLAN", detail: `Plan ${plan.name} updated: ${plan.monthly} EGP/mo, ${plan.annual} EGP/yr.` }, ...d.audit],
      }));
    },

    updatePayment: (cfg) => {
      setDb((d) => ({
        ...d,
        payments: d.payments.map((p) => (p.key === cfg.key ? cfg : p)),
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: "Admin", action: "UPDATE_PAYMENT", detail: `Payment ${cfg.key} updated: enabled=${cfg.enabled}, mode=${cfg.mode}.` }, ...d.audit],
      }));
    },

    testPayment: (key) => {
      setDb((d) => ({
        ...d,
        payments: d.payments.map((p) => (p.key === key ? { ...p, lastTest: new Date().toISOString(), lastFailure: null } : p)),
        audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: "Admin", action: "TEST_PAYMENT", detail: `Gateway test passed for ${key}.` }, ...d.audit],
      }));
    },

    markRead: (id) => {
      setDb((d) => ({
        ...d,
        messages: d.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
      }));
    },

    saveRoomProject: (p) => {
      setDb((d) => {
        const existing = d.roomProjects.some((x) => x.id === p.id);
        const list = existing ? d.roomProjects.map((x) => (x.id === p.id ? p : x)) : [p, ...d.roomProjects];
        return {
          ...d,
          roomProjects: list,
          audit: [{ id: `aud_${Date.now()}`, at: Date.now(), actor: session?.name || "User", action: "SAVE_ROOM", detail: `Room project ${p.name} saved.` }, ...d.audit],
        };
      });
    },

    deleteRoomProject: (id) => {
      setDb((d) => ({
        ...d,
        roomProjects: d.roomProjects.filter((p) => p.id !== id),
      }));
    },

    reset: () => {
      localStorage.removeItem("idea.marketplace.db");
      setDb(getInitialDb());
    },
  }), [db, session]);

  return <Ctx.Provider value={{ db, session, api }}>{children}</Ctx.Provider>;
}

export function useBackend() {
  const context = useContext(Ctx);
  if (!context) throw new Error("useBackend must be used within BackendProvider");
  return context;
}
