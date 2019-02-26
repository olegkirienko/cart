const cartData = {
    products: [
        {
            id: 1,
            title: 'Some product 1',
            href: 'https://google.com',
            img: 'https://picsum.photos/96/96/?random',
            count: 1,
            price: 500,
        },
        {
            id: 2,
            title: 'Some product 2',
            href: 'https://google.com',
            img: 'https://picsum.photos/96/96/?random',
            count: 2,
            price: 400,
        },
        {
            id: 3,
            title: 'Some product 3',
            href: 'https://google.com',
            img: 'https://picsum.photos/96/96/?random',
            count: 3,
            price: 300,
        },
        {
            id: 4,
            title: 'Some product 4',
            href: 'https://google.com',
            img: 'https://picsum.photos/96/96/?random',
            count: 4,
            price: 200,
        }, {
            id: 5,
            title: 'Some product 5',
            href: 'https://google.com',
            img: 'https://picsum.photos/96/96/?random',
            count: 5,
            price: 100,
        },

    ],
    texts: {
        checkoutTitle: 'Your cart',
        totalSum: 'Total order amount',
        quantity: 'Quantity',
        cartEmpty: 'Your cart is empty',
        currency: 'hrn',
    },
};

const cartModule = (() => {
    let cartData = null;
    let cartList = null;
    let cartFooter = null;

    const minCountPerItem = 1;
    const maxCountPerItem = 10;

    const templates = {
        container: props => {
            return `<section class="cart-container">
                <header class="cart-header">
                    ${props.headerTemplate}
                </header>
                <section class="cart-products">
                    <ul class="cart-list">
                        ${props.itemsListTemplate}
                    </ul>
                </section>
                <footer class="cart-footer">
                    ${props.footerTemplate}
                </footer>
            </section>`;
        },
        header: ({checkoutTitle}) => {
            return `<h2 class="cart-title">${checkoutTitle}</h2>`;
        },
        item: props => {
            return `<li class="cart-item" id="cart-item-${props.itemId}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${props.itemTitle}</div>
                    <div class="cart-item-count">
                        <div class="cart-item-control">
                            <div class="cart-item-decrease" data-action='{"name": "decrease", "itemId": ${props.itemId}}'>-</div>
                            <div class="cart-item-quantity">
                                <div class="cart-item-quantity-current">${props.itemCount}</div>
                                <div class="cart-item-quantity-next">${props.itemCount}</div>
                            </div>
                            <div class="cart-item-increase" data-action='{"name": "increase", "itemId": ${props.itemId}}'>+</div>
                        </div>
                        <div class="cart-item-price">x ${props.itemPrice} <span class="cart-currency">${props.currency}</span></div>
                    </div>
                    <div class="cart-item-total-price">${props.totalItemPrice} <span class="cart-currency">${props.currency}</span></div>
                </div>
                <div class="cart-item-icon">
                    <img class="cart-item-icon-image" src="${props.itemImage}" title="${props.itemTitle}" alt="${props.itemTitle}">
                    <div class="cart-item-remove" data-action='{"name": "remove", "itemId": ${props.itemId}}'></div>
                </div>
            </li>`;
        },
        footer: props => {
            return `<div class="cart-total-count">
                <div class="cart-total-count-text">${props.totalCountText}:</div>
                <div class="cart-total-count-quantity">${props.totalItemsCount}</div>
            </div>
            <div class="cart-total-price">
                <div class="cart-total-price-text">${props.totalPriceText}:</div>
                <div class="cart-total-price-quantity">${props.totalItemsPrice} <span class="cart-currency">${props.currency}</span></div>
            </div>`;
        },
        empty: ({cartEmpty}) => {
            return `<li class="cart-empty">${cartEmpty}</li>`;
        },
    };

    const updateCart = countChange => {
        if (!countChange) {
            return;
        }
        cartList.html(getItemsListTemplate(cartData));
        cartFooter.html(getFooterTemplate(cartData));
    };

    const decrease = itemId => {
        let countChange = 0;
        cartData.products = cartData.products.map(product => {
            if (product.id === itemId
                && product.count > minCountPerItem) {
                countChange = product.count - 1;
                product.count = countChange;
            }
            return product;
        });
        updateCart(countChange);
    };

    const increase = itemId => {
        let countChange = 0;
        cartData.products = cartData.products.map(product => {
            if (product.id === itemId
                && product.count < maxCountPerItem) {
                countChange = product.count + 1;
                product.count = countChange;
            }
            return product;
        });
        updateCart(countChange);
    };

    const remove = itemId => {
        if (cartData.products.length === 0) {
            return;
        }

        cartData.products = cartData.products.reduce((newProducts, product) => {
            return product.id === itemId ? newProducts : newProducts.concat([product]);
        }, []);

        if (cartData.products.length === 0) {
            jQuery(`#cart-item-${itemId}`).addClass('cart-item--removing');
            setTimeout(() => {
                cartList.html(templates.empty(cartData.texts));
                cartFooter.html('');
            }, 500);
        } else {
            jQuery(`#cart-item-${itemId}`).addClass('cart-item--removing');
            setTimeout(() => {
                cartList.html(getItemsListTemplate(cartData));
                cartFooter.html(getFooterTemplate(cartData));
            }, 500);
        }
    };

    const onCustomerAction = ({name, itemId}) => {
        switch (name) {
            case 'decrease': decrease(itemId); break;
            case 'increase': increase(itemId); break;
            case 'remove': remove(itemId);
        }
    };

    const getItemsListTemplate = ({products}) => {
        return products.reduce((initialTemplate, product) => {
            return [
                initialTemplate,
                templates.item({
                    itemId: product.id,
                    itemTitle: product.title,
                    itemCount: product.count,
                    itemPrice: product.price,
                    currency: cartData.texts.currency,
                    itemImage: product.img,
                    totalItemPrice: getTotalItemPrice(product.count, product.price),
                })
            ].join('');
        }, '');
    };

    const getFooterTemplate = ({products, texts}) => {
        return templates.footer({
            totalCountText: texts.quantity,
            totalItemsCount: getTotalItemsCount(products),
            totalPriceText: texts.totalSum,
            totalItemsPrice: getTotalItemsPrice(products),
            currency: texts.currency,
        });
    };

    const getTotalItemPrice = (count, price) => {
        return (count * price).toFixed(2);
    };

    const getTotalItemsCount = products => {
        return products.reduce((sum, product) => sum + product.count, 0);
    };

    const getTotalItemsPrice = products => {
        return (products.reduce((sum, product) => sum + (product.price * product.count), 0)).toFixed(2);
    };

    const getCartItems = () => {
        return cartData.products.slice(0);
    };

    const init = originalCartData => {
        // get a deep copy of the card data
        cartData = jQuery.extend(true, {}, originalCartData);

        const headerTemplate = templates.header(cartData.texts);
        const itemsListTemplate = getItemsListTemplate(cartData);
        const footerTemplate = getFooterTemplate(cartData);
        const wholeCartTemplate = templates.container({
            headerTemplate,
            itemsListTemplate,
            footerTemplate
        });

        jQuery(document).ready(() => {
            jQuery('#root').append(wholeCartTemplate);
            cartList = jQuery('.cart-list');
            cartFooter = jQuery('.cart-footer');
            jQuery('.cart-products').on('click', 'div[data-action]', event => {
                const action = JSON.parse(event.target.dataset.action);

                onCustomerAction(action);
            });
        });
    };

    return {
        init,
        getCartItems,
    };
})();

cartModule.init(cartData);