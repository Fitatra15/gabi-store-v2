import bcrypt from 'bcryptjs';
import { User, Category, Product, ProductImage, ProductWeight, Driver, Review } from '../src/models/index.js';

const CATEGORIES = [
  { name: 'Fruits & Légumes', slug: 'fruits-legumes', icon: '🥬', description: 'Fruits et légumes frais du marché', sort_order: 1 },
  { name: 'Viandes & Poissons', slug: 'viandes-poissons', icon: '🥩', description: 'Viandes fraîches et fruits de mer', sort_order: 2 },
  { name: 'Épicerie', slug: 'epicerie', icon: '🛒', description: 'Produits du quotidien', sort_order: 3 },
  { name: 'Produits Laitiers', slug: 'produits-laitiers', icon: '🧀', description: 'Lait, fromage, yaourts', sort_order: 4 },
  { name: 'Boissons', slug: 'boissons', icon: '🥤', description: 'Boissons fraîches et jus', sort_order: 5 },
  { name: 'Mode & Vêtements', slug: 'mode-vetements', icon: '👗', description: 'Mode locale et internationale', sort_order: 6 },
  { name: 'Hygiène & Beauté', slug: 'hygiene-beaute', icon: '🧴', description: 'Soins et hygiène', sort_order: 7 },
  { name: 'Maison & Cuisine', slug: 'maison-cuisine', icon: '🏠', description: 'Équipements pour la maison', sort_order: 8 },
];

const PRODUCTS_DATA = [
  // Fruits & Légumes
  { name: 'Mangues Bio d\'Antsiranana', slug: 'mangues-bio', price: 8000, stock: 60, vendor: 'Ferme Verte', unit: 'kg', weight: '1kg', is_featured: true, tags: ['frais', 'bio', 'local'], has_weight_options: true, catIdx: 0, description: 'Mangues juteuses cultivées biologiquement dans les vergers d\'Antsiranana. Sucrées et parfumées.', short_description: 'Mangues bio locales', images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600'] },
  { name: 'Tomates Fraîches', slug: 'tomates-fraiches', price: 4000, stock: 80, vendor: 'Marché Central', unit: 'kg', weight: '1kg', is_featured: false, tags: ['frais', 'local'], has_weight_options: true, catIdx: 0, description: 'Tomates rouges et fermes du marché central de Diego. Idéales pour les sauces et salades.', short_description: 'Tomates du marché', images: ['https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=600'] },
  { name: 'Bananes Ambilobe', slug: 'bananes-ambilobe', price: 3000, stock: 100, vendor: 'Plantation Nord', unit: 'kg', weight: '1kg', is_featured: true, tags: ['frais', 'local'], has_weight_options: true, catIdx: 0, description: 'Bananes sucrées de la région d\'Ambilobe, récoltées à maturité pour un goût optimal.', short_description: 'Bananes locales', images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600'] },
  { name: 'Brèdes Mafana', slug: 'bredes-mafana', price: 2500, stock: 45, vendor: 'Jardin Local', unit: 'botte', weight: '200g', is_featured: false, tags: ['frais', 'local', 'bio'], catIdx: 0, description: 'Brèdes mafana traditionnelles, parfaites pour le romazava malgache.', short_description: 'Brèdes fraîches', images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'] },

  // Viandes & Poissons
  { name: 'Viande de Zébu', slug: 'viande-zebu', price: 28000, stock: 30, vendor: 'Boucherie Tsaradia', unit: 'kg', weight: '1kg', is_featured: true, tags: ['frais', 'local', 'premium'], has_weight_options: true, catIdx: 1, description: 'Viande de zébu malgache de qualité supérieure. Tendre et savoureuse.', short_description: 'Zébu premium', images: ['https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600'] },
  { name: 'Crevettes Géantes', slug: 'crevettes-geantes', price: 45000, stock: 20, vendor: 'Pêcheur du Nord', unit: 'kg', weight: '1kg', is_featured: true, tags: ['frais', 'premium', 'local'], has_weight_options: true, catIdx: 1, description: 'Crevettes géantes fraîches pêchées dans le canal du Mozambique.', short_description: 'Crevettes fraîches', images: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600'] },
  { name: 'Thon Frais', slug: 'thon-frais', price: 22000, stock: 25, vendor: 'Pêcheur du Nord', unit: 'kg', weight: '1kg', is_featured: false, tags: ['frais', 'local'], has_weight_options: true, catIdx: 1, description: 'Thon rouge frais pêché au large d\'Antsiranana. Qualité sashimi.', short_description: 'Thon de Diego', images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600'] },
  { name: 'Poulet Fermier', slug: 'poulet-fermier', price: 18000, stock: 35, vendor: 'Ferme Verte', unit: 'pièce', weight: '1.5kg', is_featured: false, tags: ['frais', 'bio', 'local'], catIdx: 1, description: 'Poulet élevé en plein air dans les fermes locales d\'Antsiranana.', short_description: 'Poulet bio', images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600'] },

  // Épicerie
  { name: 'Riz Makalioka Premium', slug: 'riz-makalioka', price: 12000, stock: 200, vendor: 'Rizerie du Nord', unit: 'sac', weight: '5kg', is_featured: true, tags: ['local', 'premium'], catIdx: 2, description: 'Riz blanc Makalioka de qualité premium, base de la cuisine malgache.', short_description: 'Riz premium 5kg', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'] },
  { name: 'Vanille de Madagascar', slug: 'vanille-madagascar', price: 35000, stock: 50, vendor: 'SAVA Vanille', unit: 'lot', weight: '50g (5 gousses)', is_featured: true, tags: ['premium', 'local', 'bio'], catIdx: 2, description: 'Vanille Bourbon de la région SAVA. La meilleure vanille au monde.', short_description: 'Vanille SAVA', images: ['https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=600'] },
  { name: 'Huile de Coco Vierge', slug: 'huile-coco', price: 8000, stock: 70, vendor: 'Cocotier Bio', unit: 'bouteille', weight: '500ml', is_featured: false, tags: ['bio', 'local'], catIdx: 2, description: 'Huile de coco vierge pressée à froid, produite artisanalement.', short_description: 'Huile coco bio', images: ['https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600'] },
  { name: 'Piment Fort Local', slug: 'piment-fort', price: 3000, stock: 90, vendor: 'Épices du Nord', unit: 'sachet', weight: '100g', is_featured: false, tags: ['local', 'frais'], catIdx: 2, description: 'Piment fort d\'Antsiranana séché et moulu. Saveur intense.', short_description: 'Piment local', images: ['https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600'] },

  // Produits Laitiers
  { name: 'Yaourt Nature Artisanal', slug: 'yaourt-nature', price: 4500, stock: 40, vendor: 'Laiterie Diego', unit: 'pot', weight: '500g', is_featured: false, tags: ['frais', 'local'], catIdx: 3, description: 'Yaourt nature crémeux fabriqué artisanalement avec du lait frais local.', short_description: 'Yaourt crémeux', images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600'] },
  { name: 'Fromage Frais de Diego', slug: 'fromage-frais', price: 12000, stock: 20, vendor: 'Laiterie Diego', unit: 'pièce', weight: '250g', is_featured: true, tags: ['frais', 'local', 'premium'], catIdx: 3, description: 'Fromage frais artisanal de type mozarella, produit chaque matin.', short_description: 'Fromage artisanal', images: ['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600'] },
  { name: 'Lait Frais Pasteurisé', slug: 'lait-frais', price: 3500, stock: 50, vendor: 'Laiterie Diego', unit: 'bouteille', weight: '1L', is_featured: false, tags: ['frais', 'local'], catIdx: 3, description: 'Lait frais pasteurisé provenant des fermes laitières du Nord.', short_description: 'Lait frais 1L', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600'] },
  { name: 'Beurre Fermier', slug: 'beurre-fermier', price: 8000, stock: 30, vendor: 'Laiterie Diego', unit: 'plaquette', weight: '250g', is_featured: false, tags: ['frais', 'local', 'premium'], catIdx: 3, description: 'Beurre fermier traditionnel au goût riche et onctueux.', short_description: 'Beurre fermier', images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600'] },

  // Boissons
  { name: 'Jus de Baobab', slug: 'jus-baobab', price: 5000, stock: 60, vendor: 'Jus Tropika', unit: 'bouteille', weight: '750ml', is_featured: true, tags: ['local', 'bio'], catIdx: 4, description: 'Jus de fruit de baobab naturel, riche en vitamines et antioxydants.', short_description: 'Jus baobab bio', images: ['https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600'] },
  { name: 'THB (Three Horses Beer)', slug: 'thb-beer', price: 4000, stock: 120, vendor: 'STAR Brasserie', unit: 'bouteille', weight: '650ml', is_featured: false, tags: ['local'], catIdx: 4, description: 'La bière emblématique de Madagascar. Fraîche et désaltérante.', short_description: 'Bière THB', images: ['https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600'] },
  { name: 'Eau de Coco Fraîche', slug: 'eau-coco', price: 2000, stock: 80, vendor: 'Cocotier Bio', unit: 'bouteille', weight: '500ml', is_featured: false, tags: ['frais', 'local', 'bio'], catIdx: 4, description: 'Eau de coco naturelle, directement extraite des noix de coco fraîches.', short_description: 'Eau de coco', images: ['https://images.unsplash.com/photo-1536029927510-3c8618e8e09c?w=600'] },
  { name: 'Rhum Arrangé Vanille', slug: 'rhum-arrange', price: 25000, stock: 30, vendor: 'Distillerie Nord', unit: 'bouteille', weight: '700ml', is_featured: true, tags: ['premium', 'local'], catIdx: 4, description: 'Rhum artisanal arrangé à la vanille de Madagascar. Macération 6 mois.', short_description: 'Rhum vanille', images: ['https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600'] },

  // Mode & Vêtements
  { name: 'Lamba Malgache Artisanal', slug: 'lamba-malgache', price: 45000, stock: 15, vendor: 'Atelier Soa', unit: 'pièce', weight: '300g', is_featured: true, tags: ['artisanat', 'local', 'premium'], catIdx: 5, description: 'Lamba traditionnel malgache tissé à la main, motifs géométriques uniques.', short_description: 'Lamba artisanal', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'] },
  { name: 'T-shirt Diego Suarez', slug: 'tshirt-diego', price: 18000, stock: 50, vendor: 'Gabi Fashion', unit: 'pièce', weight: '200g', is_featured: false, tags: ['local'], catIdx: 5, description: 'T-shirt en coton avec design graphique Diego Suarez. Disponible en plusieurs tailles.', short_description: 'T-shirt Diego', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'] },
  { name: 'Chapeau Rabane', slug: 'chapeau-rabane', price: 15000, stock: 25, vendor: 'Atelier Soa', unit: 'pièce', weight: '150g', is_featured: false, tags: ['artisanat', 'local'], catIdx: 5, description: 'Chapeau tressé en raphia naturel, parfait pour le soleil tropical.', short_description: 'Chapeau raphia', images: ['https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600'] },
  { name: 'Sandales Cuir Artisanales', slug: 'sandales-cuir', price: 35000, stock: 20, vendor: 'Cuir Mada', unit: 'paire', weight: '400g', is_featured: true, tags: ['artisanat', 'premium', 'local'], catIdx: 5, description: 'Sandales en cuir véritable fabriquées à la main par les artisans d\'Antsiranana.', short_description: 'Sandales cuir', images: ['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600'] },

  // Hygiène & Beauté
  { name: 'Savon Artisanal au Ylang-Ylang', slug: 'savon-ylang', price: 6000, stock: 40, vendor: 'Savonnerie Diana', unit: 'pièce', weight: '100g', is_featured: true, tags: ['bio', 'local', 'artisanat'], catIdx: 6, description: 'Savon naturel parfumé au ylang-ylang de Nosy Be, saponifié à froid.', short_description: 'Savon ylang-ylang', images: ['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600'] },
  { name: 'Huile Essentielle Ravintsara', slug: 'he-ravintsara', price: 15000, stock: 35, vendor: 'Aroma Mada', unit: 'flacon', weight: '10ml', is_featured: false, tags: ['bio', 'local', 'premium'], catIdx: 6, description: 'Huile essentielle de Ravintsara 100% pure. Propriétés antivirales et immunostimulantes.', short_description: 'HE Ravintsara', images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600'] },
  { name: 'Shampoing Coco Naturel', slug: 'shampoing-coco', price: 7000, stock: 55, vendor: 'Savonnerie Diana', unit: 'bouteille', weight: '250ml', is_featured: false, tags: ['bio', 'local'], catIdx: 6, description: 'Shampoing doux à l\'huile de coco, sans sulfate ni paraben.', short_description: 'Shampoing bio', images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600'] },
  { name: 'Crème Hydratante Karité', slug: 'creme-karite', price: 12000, stock: 30, vendor: 'Aroma Mada', unit: 'pot', weight: '200ml', is_featured: false, tags: ['bio', 'premium'], catIdx: 6, description: 'Crème hydratante enrichie au beurre de karité et huile de coco.', short_description: 'Crème karité', images: ['https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600'] },

  // Maison & Cuisine
  { name: 'Panier Tressé Raphia', slug: 'panier-raphia', price: 22000, stock: 15, vendor: 'Vannerie du Nord', unit: 'pièce', weight: '500g', is_featured: true, tags: ['artisanat', 'local'], catIdx: 7, description: 'Panier tressé en raphia naturel par les artisans d\'Antsiranana. Décoration ou rangement.', short_description: 'Panier raphia', images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600'] },
  { name: 'Nappe Brodée Main', slug: 'nappe-brodee', price: 35000, stock: 10, vendor: 'Atelier Soa', unit: 'pièce', weight: '400g', is_featured: false, tags: ['artisanat', 'premium', 'local'], catIdx: 7, description: 'Nappe en coton brodée à la main avec motifs floraux traditionnels.', short_description: 'Nappe artisanale', images: ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600'] },
  { name: 'Set de Cuisine en Bois', slug: 'set-cuisine-bois', price: 28000, stock: 20, vendor: 'Bois Précieux', unit: 'set', weight: '800g', is_featured: false, tags: ['artisanat', 'local', 'premium'], catIdx: 7, description: 'Set de 5 ustensiles de cuisine en bois de palissandre sculpté à la main.', short_description: 'Ustensiles bois', images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'] },
  { name: 'Bougie Parfumée Vanille', slug: 'bougie-vanille', price: 10000, stock: 40, vendor: 'Savonnerie Diana', unit: 'pièce', weight: '200g', is_featured: false, tags: ['local', 'artisanat'], catIdx: 7, description: 'Bougie artisanale en cire de soja parfumée à la vanille de Madagascar.', short_description: 'Bougie vanille', images: ['https://images.unsplash.com/photo-1602607616415-e3e0f4715fb1?w=600'] },
];

const WEIGHT_OPTIONS = [
  { label: '500g (½ kg)', value: 0.5, price_multiplier: 0.5 },
  { label: '1 kg', value: 1, price_multiplier: 1 },
  { label: '1.5 kg', value: 1.5, price_multiplier: 1.5 },
  { label: '2 kg', value: 2, price_multiplier: 2 },
];

const DRIVERS = [
  { name: 'Rakoto Jean', phone: '+261 34 12 345 67', vehicle: 'Moto', avatar: '🏍️', rating: 4.8, is_available: true, current_lat: -12.275, current_lng: 49.295 },
  { name: 'Fanja Marie', phone: '+261 33 98 765 43', vehicle: 'Vélo', avatar: '🚲', rating: 4.6, is_available: true, current_lat: -12.282, current_lng: 49.288 },
  { name: 'Solo Hery', phone: '+261 32 45 678 90', vehicle: 'Voiture', avatar: '🚗', rating: 4.9, is_available: true, current_lat: -12.270, current_lng: 49.300 },
];

const SAMPLE_REVIEWS = [
  { rating: 5, comment: 'Excellent produit, très frais ! Livraison rapide.', name: 'Nadia R.' },
  { rating: 4, comment: 'Bonne qualité, je recommande.', name: 'Jean-Pierre M.' },
  { rating: 5, comment: 'Parfait, exactement ce que je cherchais.', name: 'Soa V.' },
  { rating: 4, comment: 'Très bon rapport qualité-prix. Merci Gabi-Store !', name: 'Hery T.' },
  { rating: 3, comment: 'Correct mais pourrait être mieux emballé.', name: 'Marie L.' },
];

export async function seedDatabase() {
  // Check if data exists
  const userCount = await User.count();
  if (userCount > 0) {
    console.log('📦 Base de données déjà initialisée');
    return;
  }

  console.log('🌱 Initialisation de la base de données...');

  // Create admin
  const adminHash = await bcrypt.hash('Admin@2026!', 12);
  const admin = await User.create({
    name: 'Administrateur Gabi-Store',
    email: 'admin@gabi-store.com',
    phone: '+261 32 123 45 67',
    password_hash: adminHash,
    role: 'admin',
    is_verified: true,
  });

  // Create sample customer
  const customerHash = await bcrypt.hash('client123', 12);
  const reviewUsers = [];
  for (const rv of SAMPLE_REVIEWS) {
    const u = await User.create({
      name: rv.name,
      email: `${rv.name.toLowerCase().replace(/[^a-z]/g, '')}@gabi-store.com`,
      password_hash: customerHash,
      role: 'customer',
      is_verified: true,
    });
    reviewUsers.push(u);
  }

  // Create categories
  const categories = [];
  for (const catData of CATEGORIES) {
    const cat = await Category.create(catData);
    categories.push(cat);
  }

  // Create drivers
  for (const driverData of DRIVERS) {
    await Driver.create(driverData);
  }

  // Create products
  for (const pData of PRODUCTS_DATA) {
    const category = categories[pData.catIdx];
    const product = await Product.create({
      name: pData.name,
      slug: pData.slug,
      description: pData.description,
      short_description: pData.short_description,
      price: pData.price,
      stock: pData.stock,
      category_id: category.id,
      vendor: pData.vendor,
      unit: pData.unit,
      weight: pData.weight,
      is_featured: pData.is_featured,
      status: 'active',
      tags: pData.tags,
      has_weight_options: pData.has_weight_options || false,
      avg_rating: 4 + Math.random(),
      reviews_count: Math.floor(Math.random() * 20) + 5,
    });

    // Images
    for (let i = 0; i < pData.images.length; i++) {
      await ProductImage.create({
        product_id: product.id, url: pData.images[i], is_primary: i === 0, sort_order: i,
      });
    }

    // Weight options for kg products
    if (pData.has_weight_options) {
      for (const wo of WEIGHT_OPTIONS) {
        await ProductWeight.create({ product_id: product.id, ...wo });
      }
    }

    // Random reviews (2-3 per product)
    const reviewCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < reviewCount; i++) {
      const rv = SAMPLE_REVIEWS[i % SAMPLE_REVIEWS.length];
      const user = reviewUsers[i % reviewUsers.length];
      await Review.create({
        product_id: product.id,
        user_id: user.id,
        rating: rv.rating,
        comment: rv.comment,
        is_verified: true,
      });
    }
  }

  console.log('✅ Base de données initialisée avec succès !');
  console.log(`   📂 ${CATEGORIES.length} catégories`);
  console.log(`   📦 ${PRODUCTS_DATA.length} produits`);
  console.log(`   🚚 ${DRIVERS.length} livreurs`);
  console.log(`   👤 Admin: admin@gabi-store.com / Admin@2026!`);
}
