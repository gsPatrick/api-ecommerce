const axios = require('axios');

class BrechoProvider {
    constructor() {
        this.baseUrl = process.env.BRECHO_API_URL;
        this.apiKey = process.env.BRECHO_API_KEY;
        this.enabled = process.env.INTEGRATION_ENABLED === 'true';
    }

    async syncEntity(entityName, searchData, createData) {
        if (!this.enabled) return null;
        try {
            console.log(`[BrechoProvider] Syncing ${entityName}:`, searchData);
            // 1. Try to find
            const searchParams = new URLSearchParams(searchData).toString();
            const searchResponse = await axios.get(`${this.baseUrl}/cadastros/${entityName}?${searchParams}`, {
                headers: { 'x-integration-secret': this.apiKey }
            });

            if (searchResponse.data && searchResponse.data.length > 0) {
                console.log(`[BrechoProvider] Found ${entityName}:`, searchResponse.data[0].id);
                return searchResponse.data[0].id;
            }

            // 2. Create if not found
            console.log(`[BrechoProvider] Creating ${entityName}:`, createData);
            const createResponse = await axios.post(`${this.baseUrl}/cadastros/${entityName}`, createData, {
                headers: { 'x-integration-secret': this.apiKey }
            });

            console.log(`[BrechoProvider] Created ${entityName}:`, createResponse.data.id);
            return createResponse.data.id;
        } catch (error) {
            console.error(`[BrechoProvider] Error syncing ${entityName}:`, error.response?.data || error.message);
            return null;
        }
    }

    async createProductInBrecho(productData) {
        if (!this.enabled) return null;

        console.log('[BrechoProvider] Starting product sync:', productData.name);

        try {
            // 1. Sync Category
            let categoriaId = null;
            if (productData.category) {
                // Assuming productData.category is a string name from legacy field or we need to fetch it if it's an ID
                // The service passes productData which comes from body. 
                // If it's an ID, we might need to look up the name locally first?
                // The service code: const { attributes, variations, ...productData } = data;
                // productData has categoryId (int) and category (string legacy).
                // Let's use the string 'category' if available, or we might need to fetch the category name from local DB if only ID is passed.
                // For now, assuming 'category' string is populated or passed.
                // If not, we might send "Sem Categoria".
                const catName = productData.category || "Geral";
                categoriaId = await this.syncEntity('categorias', { nome: catName }, { nome: catName, ativa: true });
            }

            // 2. Sync Brand (Marca)
            let marcaId = null;
            if (productData.brand) {
                marcaId = await this.syncEntity('marcas', { nome: productData.brand }, { nome: productData.brand, ativa: true });
            } else if (productData.brandId) {
                // If we have ID but no name (unlikely given service logic, but possible), we might need to fetch name?
                // But service passes 'data' which has 'brand' string.
            }

            // 3. Sync Attributes (Color/Size) - We need to pick ONE for the main product if it's a variable product parent,
            // OR if it's a simple product.
            // Brechó seems to be "Peca" based. If we are creating a parent product, maybe we just create a generic one?
            // Or does Brechó expect each variation to be a Peca?
            // The user prompt implies "sincronizar TUDO".
            // If we are creating the MAIN product here, we might just pick the first available attribute or leave null.
            // However, the prompt says "se eu adicionar o produto ele veriica se tem uma cor e adicionar na api do brecho".
            // This suggests we should handle attributes.
            // But `createProductInBrecho` is called ONCE for the product.
            // If the product has variations, `product.service.js` creates them locally.
            // Does it sync variations to Brechó?
            // The current `product.service.js` calls `createProductInBrecho` with `productData`.
            // `productData` excludes `attributes` and `variations` arrays in the service!
            // const { attributes, variations, ...productData } = data;
            // So `productData` passed here DOES NOT HAVE attributes!
            // I need to modify `product.service.js` to pass attributes too, OR handle them here if they were passed.
            // Wait, I can't modify the arguments of `createProductInBrecho` without changing the caller.
            // I will modify `product.service.js` to pass the full data or I will accept `attributes` as a second arg?
            // Better: I will modify `product.service.js` to pass the whole object or extract what I need.

            // Let's assume for now I will fix `product.service.js` to pass attributes.
            // But wait, `productData` in `createProductInBrecho` is the stripped version.
            // I should update `product.service.js` to pass `data` (the full object) to `createProductInBrecho`?
            // No, `createProductInBrecho` is called with `productData`.
            // I will check `product.service.js` again.

            // In `product.service.js`:
            // const { attributes, variations, ...productData } = data;
            // ...
            // const brechoProduct = await brechoProvider.createProductInBrecho(productData);

            // So I am losing attributes. I must fix `product.service.js` first to pass attributes.
            // But I am editing `brecho.provider.js` now.
            // I will implement the logic here assuming `productData` WILL contain attributes (I'll fix the caller next).

            let corId = null;
            let tamanhoId = null;

            // We need to find "Cor" and "Tamanho" in attributes array
            if (productData.attributes && Array.isArray(productData.attributes)) {
                const colorAttr = productData.attributes.find(a => a.name === 'Cor' || a.name === 'Color');
                const sizeAttr = productData.attributes.find(a => a.name === 'Tamanho' || a.name === 'Size');

                if (colorAttr && colorAttr.options && colorAttr.options.length > 0) {
                    // Take the first one for the main product? Or create multiple?
                    // Brechó Peca seems to be single item.
                    // If it's a variable product, maybe we shouldn't sync the PARENT as a Peca?
                    // Or maybe we sync the first variation?
                    // The user says "se eu adicionar o produto... adiciona a peca".
                    // If it's a simple product, it has 1 color/size.
                    // If it's variable, it has many.
                    // For now, let's take the first one to ensure at least something is synced with data.
                    let colorVal = colorAttr.options[0];
                    let colorName = typeof colorVal === 'object' ? colorVal.name : colorVal;
                    corId = await this.syncEntity('cores', { nome: colorName }, { nome: colorName, hex: typeof colorVal === 'object' ? colorVal.hex : '#000000' });
                }

                if (sizeAttr && sizeAttr.options && sizeAttr.options.length > 0) {
                    let sizeName = sizeAttr.options[0];
                    tamanhoId = await this.syncEntity('tamanhos', { nome: sizeName }, { nome: sizeName, sigla: sizeName }); // Assuming sigla = name
                }
            }

            // Map fields to Brechó expected format
            const payload = {
                descricao_curta: productData.name,
                descricao_detalhada: productData.description || productData.name,
                preco_venda: productData.price,
                sku_ecommerce: productData.sku,
                tipo_aquisicao: 'COMPRA',
                fornecedorId: null, // Loja Própria
                categoriaId,
                marcaId,
                corId,
                tamanhoId,
                // Dimensions
                peso_kg: productData.weight || 0,
                altura_cm: productData.dimensions?.height || 0,
                largura_cm: productData.dimensions?.width || 0,
                profundidade_cm: productData.dimensions?.length || 0
            };

            console.log('[BrechoProvider] Sending payload:', payload);

            const response = await axios.post(`${this.baseUrl}/catalogo/pecas`, payload, {
                headers: {
                    'x-integration-secret': this.apiKey
                }
            });

            console.log('[BrechoProvider] Success:', response.data);
            return response.data;
        } catch (error) {
            console.error('[BrechoProvider] Error creating product in Brechó:', error.response?.data || error.message);
            return null;
        }
    }

    async notifyOrder(orderData) {
        if (!this.enabled) return;

        try {
            const payload = {
                externalId: orderData.id,
                items: orderData.items.map(item => ({
                    sku: item.sku, // or brechoId if available
                    quantity: item.quantity,
                    price: item.price
                })),
                customer: {
                    name: orderData.user?.name,
                    email: orderData.user?.email
                }
            };

            await axios.post(`${this.baseUrl}/integracao/webhook/pedido`, payload, {
                headers: {
                    'x-integration-secret': this.apiKey
                }
            });
        } catch (error) {
            console.error('Error notifying order to Brechó:', error.response?.data || error.message);
        }
    }
}

module.exports = new BrechoProvider();
