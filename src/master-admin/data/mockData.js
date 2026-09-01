export const stats = [
    { label: "Total Users", value: "12,845", change: "+12.5%", icon: "Users" },
    { label: "Total Merchants", value: "482", change: "+4.2%", icon: "Store" },
    { label: "Total Orders", value: "24,560", change: "+18.2%", icon: "ShoppingBag" },
    { label: "Revenue", value: "₹4,25,000", change: "+15.8%", icon: "DollarSign" },
];

export const recentOrders = [
    { id: "ORD001", user: "John Doe", merchant: "Green Earth Organics", amount: "₹1,250", status: "Delivered", date: "2024-03-15" },
    { id: "ORD002", user: "Jane Smith", merchant: "Millit Delights", amount: "₹850", status: "Processing", date: "2024-03-15" },
    { id: "ORD003", user: "Robert Wilson", merchant: "Nature's Basket", amount: "₹2,100", status: "Shipped", date: "2024-03-14" },
    { id: "ORD004", user: "Alice Johnson", merchant: "Organic Roots", amount: "₹550", status: "Cancelled", date: "2024-03-14" },
    { id: "ORD005", user: "Sarah Brown", merchant: "Green Earth Organics", amount: "₹1,800", status: "Delivered", date: "2024-03-13" },
];

export const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
];

export const merchants = [
    {
        id: 1,
        businessName: "Green Earth Organics",
        ownerName: "Arun Kumar",
        description: "Premium organic millets and grains directly from farmers.",
        status: "Active",
        email: "arun@greenearth.com",
        mobileNumber: "+91 9876543210",
        category: "Organic Grains",
        gstNumber: "22AAAAA0000A1Z5",
        address: "123, Farmer's Lane, Salem",
        city: "Salem",
        state: "Tamil Nadu",
        pincode: "636001",
        createdDate: "2024-01-10",
        kyc: {
            aadhaar: "1234 5678 9012",
            pan: "ABCDE1234F",
            documents: ["https://picsum.photos/seed/doc1/400/300", "https://picsum.photos/seed/doc2/400/300"]
        },
        bank: {
            holderName: "Green Earth Organics",
            accountNumber: "9876543210123",
            ifsc: "HDFC0001234",
            bankName: "HDFC Bank"
        },
        products: [
            { id: 101, name: "Finger Millet (Ragi)", price: "₹120", stock: 50, image: "https://picsum.photos/seed/ragi/100/100" },
            { id: 102, name: "Pearl Millet (Bajra)", price: "₹100", stock: 35, image: "https://picsum.photos/seed/bajra/100/100" },
            { id: 103, name: "Foxtail Millet", price: "₹150", stock: 20, image: "https://picsum.photos/seed/foxtail/100/100" },
        ],
        giftCards: [
            { id: 201, title: "Millet & Nut Wellness Box", price: "₹899", image: "https://picsum.photos/seed/giftbox/100/100" },
            { id: 202, title: "Premium Almond & Cashew Royal Box", price: "₹1,299", image: "https://picsum.photos/seed/nutsbox/100/100" },
            { id: 203, title: "Divine Pooja Festive Celebration Box", price: "₹1,599", image: "https://picsum.photos/seed/poojabox/100/100" }
        ]
    },
    {
        id: 2,
        businessName: "Millet Delights",
        ownerName: "Priya Sharma",
        description: "Healthy millet-based snacks and cookies.",
        status: "Pending",
        email: "priya@milletdelights.com",
        mobileNumber: "+91 8765432109",
        category: "Snacks",
        gstNumber: "22BBBBB0000B1Z5",
        address: "45, Food Park, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        createdDate: "2024-02-15",
        kyc: {
            aadhaar: "2345 6789 0123",
            pan: "BCDEF2345G",
            documents: ["https://picsum.photos/seed/doc3/400/300"]
        },
        bank: {
            holderName: "Millet Delights",
            accountNumber: "8765432109876",
            ifsc: "ICIC0005678",
            bankName: "ICIC Bank"
        },
        products: [
            { id: 104, name: "Millet Cookies", price: "₹80", stock: 100, image: "https://picsum.photos/seed/cookies/100/100" },
        ],
        giftCards: []
    }
];

export const productDetails = {
    id: 101,
    name: "Finger Millet (Ragi) - Organic",
    price: "₹150",
    offerPrice: "₹120",
    description: "High-quality organic Finger Millet (Ragi) sourced directly from the hills of Salem. Rich in calcium and fiber, perfect for a healthy diet.",
    stock: 50,
    category: "Grains",
    subcategory: "Millets",
    weight: "500",
    unit: "g",
    nutritionInfo: {
        calories: "328 kcal",
        protein: "7.3 g",
        fiber: "3.6 g",
        fat: "1.3 g",
        carbohydrates: "72 g"
    },
    variants: ["250g", "500g", "1kg"],
    status: "In Stock",
    image: "https://picsum.photos/seed/ragi-large/600/600"
};

export const giftCardDetails = {
    id: 201,
    title: "Millet & Nut Wellness Box",
    description: "A specially curated wellness collection featuring the best of Salem's organic millets and premium hand-picked nuts. This festive gift box is designed for balanced nutrition and delightful snacking.",
    price: "₹899",
    validity: "Combo Pack",
    status: "In Stock",
    image: "https://picsum.photos/seed/giftbox/800/600",
    milletProductsCount: "3 Packs",
    nutsProductsCount: "2 Tins",
    boxWeight: "1.5 KG",
    associatedProducts: [
        { name: "Organic Ragi Flour (500g)", price: "Included" },
        { name: "Foxtail Millet (500g)", price: "Included" },
        { name: "Roasted Salted Almonds (200g)", price: "Included" },
        { name: "Honey Glazed Cashews (200g)", price: "Included" },
        { name: "Millet Snap Cookies", price: "Included" }
    ]
};

export const giftCardsDetailed = {
    "201": {
        ...giftCardDetails
    },
    "202": {
        id: 202,
        title: "Premium Almond & Cashew Royal Box",
        description: "An exquisite collection of hand-picked premium almonds and cashews. Roasted to perfection and packed in airtight luxury tins, ideal for premium corporate and festive gifting.",
        price: "₹1,299",
        validity: "Nuts Gifting",
        status: "In Stock",
        image: "https://picsum.photos/seed/nutsbox/800/600",
        milletProductsCount: "0 Packs",
        nutsProductsCount: "4 Tins",
        boxWeight: "1.2 KG",
        associatedProducts: [
            { name: "Roasted California Almonds (250g)", price: "Included" },
            { name: "Premium Salted Cashews (250g)", price: "Included" },
            { name: "Spiced Barbecue Pistachios (200g)", price: "Included" },
            { name: "Sweet Honey Glazed Almonds (250g)", price: "Included" }
        ]
    },
    "203": {
        id: 203,
        title: "Divine Pooja Festive Celebration Box",
        description: "A traditional celebratory box containing premium brass puja essentials, organic dhoop sticks, pure honey, and sacred offerings. Crafted to bring auspiciousness and peace to your festive occasions.",
        price: "₹1,599",
        validity: "Festive Pooja Pack",
        status: "In Stock",
        image: "https://picsum.photos/seed/poojabox/800/600",
        milletProductsCount: "0 Packs",
        nutsProductsCount: "1 Tin",
        poojaProductsCount: "4 Items",
        boxWeight: "2.0 KG",
        associatedProducts: [
            { name: "Premium Brass Diya & Plate", price: "Included" },
            { name: "Organic Sandalwood Dhoop (20 sticks)", price: "Included" },
            { name: "Pure Sidr Honey (200g)", price: "Included" },
            { name: "Select Premium Dry Fruits (200g)", price: "Included" },
            { name: "Sacred Gangajal & Kumkum Set", price: "Included" }
        ]
    }
};

export const users = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "+91 9876543210", status: "Active", joinedDate: "2024-01-15", totalOrders: 12 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+91 8765432109", status: "Active", joinedDate: "2024-02-20", totalOrders: 5 },
    { id: 3, name: "Robert Wilson", email: "robert@example.com", phone: "+91 7654321098", status: "Blocked", joinedDate: "2024-03-05", totalOrders: 0 },
    { id: 4, name: "Alice Johnson", email: "alice@example.com", phone: "+91 6543210987", status: "Active", joinedDate: "2024-03-10", totalOrders: 2 },
];

export const merchantOrders = [
    {
        id: "ORD-1001",
        merchant: "Green Earth Organics",
        customer: "John Doe",
        amount: "₹1,250",
        status: "Delivered",
        date: "2024-03-15",
        items: "Finger Millet x 2, Foxtail Millet x 1"
    },
    {
        id: "ORD-1002",
        merchant: "Millet Delights",
        customer: "Jane Smith",
        amount: "₹850",
        status: "Shipped",
        date: "2024-03-14",
        items: "Millet Cookies x 3"
    },
    {
        id: "ORD-1003",
        merchant: "Green Earth Organics",
        customer: "Alice Johnson",
        amount: "₹2,100",
        status: "Processing",
        date: "2024-03-14",
        items: "Organic Ragi Flour x 5"
    },
    {
        id: "ORD-1004",
        merchant: "Nature's Basket",
        customer: "Steve Jobs",
        amount: "₹550",
        status: "Cancelled",
        date: "2024-03-13",
        items: "Pearl Millet x 1"
    },
];

export const categories = [
    { id: 1, name: "Organic Grains", image: "https://picsum.photos/seed/grains/200/200", totalProducts: 45, status: "Active", description: "Pure and traditional organic grains sourced directly from sustainable farms in the Salem region." },
    { id: 2, name: "Healthy Snacks", image: "https://picsum.photos/seed/snacks/200/200", totalProducts: 28, status: "Active", description: "Nutritious and delicious snacks made from traditional millets and natural sweeteners." },
    { id: 3, name: "Beverages", image: "https://picsum.photos/seed/beverages/200/200", totalProducts: 15, status: "Inactive", description: "Authentic herbal drinks and health mixes designed for daily wellness and energy." },
    { id: 4, name: "Flours", image: "https://picsum.photos/seed/flours/200/200", totalProducts: 32, status: "Active", description: "Stone-ground organic flours preserving the natural nutrients and traditional texture." },
];

export const reports = [
    { id: 1, title: "Monthly Sales Report - March", type: "Sales", date: "2024-03-31", size: "1.2 MB" },
    { id: 2, title: "Merchant Performance Audit", type: "Performance", date: "2024-03-15", size: "850 KB" },
    { id: 3, title: "User Growth Analytics", type: "Users", date: "2024-03-01", size: "2.4 MB" },
    { id: 4, title: "Inventory Status Summary", type: "Inventory", date: "2024-02-28", size: "1.1 MB" },
];
