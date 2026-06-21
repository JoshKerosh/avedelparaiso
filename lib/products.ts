import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Product, { IProduct } from '@/models/Product';
import Category from '@/models/Category';
import Settings, { ISettings } from '@/models/Settings';
import type {
  ProductListItem,
  ProductDetail,
  CategoryRef,
  PaginatedProducts,
} from '@/types/product';

type MongoFilter = Record<string, unknown>;

export interface ProductQueryParams {
  search?: string;
  category1?: string;
  category2?: string;
  category3?: string;
}

export interface GetProductsParams extends ProductQueryParams {
  sort?: string;
  page?: number;
  limit?: number;
}

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  name: { name: 1 },
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

/**
 * Builds the MongoDB filter for the public catalog from search + 3-level
 * category selections. Shared by the data layer and the public API so both
 * stay in sync. Assumes a DB connection is already open.
 */
export async function buildProductQuery(params: ProductQueryParams): Promise<MongoFilter> {
  const { search, category1, category2, category3 } = params;
  const query: MongoFilter = {};

  const searchOr = search
    ? [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    : null;

  let categoryCondition: MongoFilter | null = null;

  if (category3) {
    categoryCondition = { category3Id: category3 };
  } else if (category2) {
    const level3 = await Category.find({ parentId: category2, level: 3 }).select('_id').lean<{ _id: unknown }[]>();
    const level3Ids = level3.map((c) => c._id);
    categoryCondition = {
      $or: [
        { category2Id: category2, category3Id: null },
        { category3Id: { $in: level3Ids } },
      ],
    };
  } else if (category1) {
    const level2 = await Category.find({ parentId: category1, level: 2 }).select('_id').lean<{ _id: unknown }[]>();
    const level2Ids = level2.map((c) => c._id);
    const level3 = await Category.find({ parentId: { $in: level2Ids }, level: 3 }).select('_id').lean<{ _id: unknown }[]>();
    const level3Ids = level3.map((c) => c._id);
    categoryCondition = {
      $or: [
        { category1Id: category1, category2Id: null },
        { category2Id: { $in: level2Ids }, category3Id: null },
        { category3Id: { $in: level3Ids } },
      ],
    };
  }

  if (searchOr && categoryCondition) {
    query.$and = [{ $or: searchOr }, categoryCondition];
  } else if (searchOr) {
    query.$or = searchOr;
  } else if (categoryCondition) {
    Object.assign(query, categoryCondition);
  }

  return query;
}

function toListItem(doc: IProduct): ProductListItem {
  return {
    _id: String(doc._id),
    name: doc.name,
    price: doc.price,
    stock: doc.stock,
    lowStockThreshold: doc.lowStockThreshold,
    images: (doc.images ?? []).map((img) => ({ url: img.url, isMain: !!img.isMain })),
  };
}

/** Fetches a paginated, filtered, sorted page of products for the catalog. */
export async function getProducts(params: GetProductsParams = {}): Promise<PaginatedProducts> {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit ?? DEFAULT_LIMIT));
  const sort = SORT_MAP[params.sort ?? 'newest'] ?? SORT_MAP.newest;
  const query = await buildProductQuery(params);

  const [docs, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IProduct[]>(),
    Product.countDocuments(query),
  ]);

  return {
    products: docs.map(toListItem),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

interface LeanPopulatedProduct extends Omit<IProduct, 'category1Id' | 'category2Id' | 'category3Id'> {
  category1Id?: CategoryRef | null;
  category2Id?: CategoryRef | null;
  category3Id?: CategoryRef | null;
}

function toCategoryRef(cat?: CategoryRef | null): CategoryRef | null {
  if (!cat) return null;
  return { _id: String(cat._id), name: cat.name };
}

/** Fetches a single product with populated category names, or null. */
export async function getProductById(id: string): Promise<ProductDetail | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const doc = await Product.findById(id)
    .populate('category1Id category2Id category3Id')
    .lean<LeanPopulatedProduct | null>();

  if (!doc) return null;

  return {
    ...toListItem(doc as unknown as IProduct),
    description: doc.description,
    category1Id: toCategoryRef(doc.category1Id),
    category2Id: toCategoryRef(doc.category2Id),
    category3Id: toCategoryRef(doc.category3Id),
  };
}

export async function getRootCategories(): Promise<CategoryRef[]> {
  await connectDB();
  const cats = await Category.find({ level: 1, parentId: null })
    .sort({ name: 1 })
    .lean<{ _id: unknown; name: string }[]>();
  return cats.map((c) => ({ _id: String(c._id), name: c.name }));
}

export async function getChildCategories(parentId: string): Promise<CategoryRef[]> {
  await connectDB();
  const cats = await Category.find({ parentId })
    .sort({ name: 1 })
    .lean<{ _id: unknown; name: string }[]>();
  return cats.map((c) => ({ _id: String(c._id), name: c.name }));
}

export async function getSettings(): Promise<{ heroBannerUrl: string } | null> {
  await connectDB();
  const settings = await Settings.findOne().lean<ISettings | null>();
  if (!settings) return null;
  return { heroBannerUrl: settings.heroBannerUrl ?? '' };
}
