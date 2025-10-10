class PageSwitcher {
    constructor() {
        this.pages = Array.from(document.querySelectorAll('.page'));
        this.footerIcons = document.querySelectorAll('footer .icon');
        this.currentIndex = 0;
        this.startX = 0;
        this.isAnimating = false;
        
        // 明确定义主页面顺序
        this.mainPages = ['home', 'order', 'add', 'switch', 'user'];
        // 子页面列表
        this.subPages = ['energy', 'price', 'recycle', 'official', 'info'];
        
        // 创建页面映射，便于快速查找
        this.pageMap = {};
        this.pages.forEach(page => {
            this.pageMap[page.dataset.page] = page;
        });

        this.init();
        this.isInitialized = false;
    }

    init() {
        this.disableTransitions();
        this.initPagesPosition();

        window.addEventListener('load', () => {
            document.body.classList.remove('loading');
            this.enableTransitions();
            this.isInitialized = true;
        });

        this.initEvents();
        this.updateFooter();
        this.initSubPages();
    }

    disableTransitions() {
        this.pages.forEach(page => {
            page.style.transition = 'none';
        });
    }

    enableTransitions() {
        this.pages.forEach(page => {
            page.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    }

    initPagesPosition() {
        this.pages.forEach(page => {
            page.style.willChange = 'transform, opacity';
            const pageName = page.dataset.page;
            
            if (pageName === 'home') {
                // 只有主页初始显示
                page.style.transform = 'translateX(0)';
                page.style.opacity = '1';
                page.style.pointerEvents = 'auto';
                page.classList.add('active');
            } else {
                // 其他所有页面都隐藏
                page.style.transform = 'translateX(100%)';
                page.style.opacity = '0';
                page.style.pointerEvents = 'none';
                page.classList.remove('active');
            }
        });
    }

    initSubPages() {
        this.subPages.forEach(pageName => {
            const page = this.pageMap[pageName];
            if (page) {
                // 清除旧按钮防止重复
                const existingBtn = page.querySelector('.back-button');
                if (existingBtn) existingBtn.remove();

                // 创建返回按钮
                const backBtn = document.createElement('button');
                backBtn.className = 'back-button';
                
                // 根据页面类型设置不同的返回文本
                if (pageName === 'info') {
                    backBtn.textContent = '← 返回站点';
                    backBtn.addEventListener('click', () => this.backFromSubPage('home'));
                } else {
                    backBtn.textContent = '← 返回订单';
                    backBtn.addEventListener('click', () => this.backFromSubPage('order'));
                }
                
                page.insertAdjacentElement('afterbegin', backBtn);

                // 初始化可编辑内容
                const content = page.querySelector('.editable-content');
                if (content && !content.innerHTML.trim()) {
                    content.innerHTML = `
                        <h2>${this.getPageTitle(pageName)}详情</h2>
                        <p>${this.getDefaultContent(pageName)}</p>
                    `;
                }
            }
        });
    }

    initEvents() {
        // 触摸事件
        document.addEventListener('touchstart', e => {
            if (!this.isAnimating) this.startX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', e => {
            if (this.isAnimating || !this.startX) return;

            const endX = e.changedTouches[0].clientX;
            const deltaX = endX - this.startX;
            const threshold = 50;

            if (Math.abs(deltaX) > threshold) {
                const direction = deltaX > 0 ? 'right' : 'left';
                const newIndex = direction === 'right'
                    ? Math.max(0, this.currentIndex - 1)
                    : Math.min(this.mainPages.length - 1, this.currentIndex + 1);

                this.switchMainPage(newIndex, direction);
            }
            this.startX = 0;
        });

        // 底部导航点击事件
        this.footerIcons.forEach((icon, index) => {
            icon.addEventListener('click', e => {
                e.preventDefault();
                if (index >= this.mainPages.length) return;
                const direction = index > this.currentIndex ? 'left' : 'right';
                this.switchMainPage(index, direction);
            });
        });

        // 虫站点页面点击事件
        const homePage = this.pageMap['home'];
        if (homePage) {
            homePage.addEventListener('click', e => {
                const link = e.target.closest('a.orderfix');
                if (!link) return;

                const targetPage = link.dataset.target;
                if (targetPage) {
                    this.switchToSubPage(targetPage);
                }
            });
        }

        // 订单项点击事件
        const orderContainer = document.querySelector('.order-container');
        if (orderContainer) {
            orderContainer.addEventListener('click', e => {
                const item = e.target.closest('.order-item:not(.blank)');
                if (!item) return;

                const targetPage = item.dataset.target;
                if (targetPage) {
                    this.switchToSubPage(targetPage);
                }
            });
        }
    }

    switchMainPage(newIndex, direction) {
        if (this.isAnimating || newIndex === this.currentIndex) return;
        
        const currentPageName = this.mainPages[this.currentIndex];
        const newPageName = this.mainPages[newIndex];
        
        const currentPage = this.pageMap[currentPageName];
        const newPage = this.pageMap[newPageName];
        
        if (!currentPage || !newPage) return;

        this.isAnimating = true;

        // 设置新页面初始位置
        newPage.style.transform = direction === 'left' 
            ? 'translateX(100%)' 
            : 'translateX(-100%)';
        newPage.style.opacity = '1';
        newPage.style.pointerEvents = 'auto';
        newPage.classList.add('active');

        requestAnimationFrame(() => {
            // 动画当前页面移出
            currentPage.style.transform = direction === 'left' 
                ? 'translateX(-100%)' 
                : 'translateX(100%)';
            currentPage.style.opacity = '0';

            // 动画新页面进入
            newPage.style.transform = 'translateX(0)';

            setTimeout(() => {
                currentPage.classList.remove('active');
                this.currentIndex = newIndex;
                this.isAnimating = false;
                this.updateFooter();
            }, 400);
        });
    }

    switchToSubPage(pageName) {
        const targetPage = this.pageMap[pageName];
        if (!targetPage || this.isAnimating) return;

        this.isAnimating = true;
        
        // 隐藏当前主页面
        const currentPageName = this.mainPages[this.currentIndex];
        const currentPage = this.pageMap[currentPageName];
        if (currentPage) {
            currentPage.style.opacity = '0.5';
        }

        // 显示子页面
        targetPage.style.transform = 'translateX(0)';
        targetPage.style.opacity = '1';
        targetPage.style.pointerEvents = 'auto';
        targetPage.classList.add('sub-active');

        setTimeout(() => this.isAnimating = false, 400);
    }

    backFromSubPage(returnToPage) {
        const currentSubPage = document.querySelector('.page.sub-active');
        if (!currentSubPage || this.isAnimating) return;

        this.isAnimating = true;

        // 隐藏子页面
        currentSubPage.style.transform = 'translateX(100%)';
        currentSubPage.style.opacity = '0';
        currentSubPage.style.pointerEvents = 'none';
        currentSubPage.classList.remove('sub-active');

        // 显示返回的主页面
        const returnPage = this.pageMap[returnToPage];
        if (returnPage) {
            returnPage.style.opacity = '1';
            
            // 如果是返回订单页面，需要更新当前索引
            if (returnToPage === 'order') {
                this.currentIndex = this.mainPages.indexOf('order');
            } else if (returnToPage === 'home') {
                this.currentIndex = this.mainPages.indexOf('home');
            }
        }

        setTimeout(() => {
            this.isAnimating = false;
            this.updateFooter();
        }, 400);
    }

    updateFooter() {
        this.footerIcons.forEach((icon, index) => {
            const isActive = index === this.currentIndex;
            icon.classList.toggle('active', isActive);
            const img = icon.querySelector('img');
            if (img) {
                img.style.transform = isActive ? 'scale(1.1)' : '';
            }
        });
    }

    getPageTitle(pageName) {
        const titles = {
            energy: '能量任务',
            price: '价格回收',
            recycle: '回收站',
            official: '官方任务',
            info: '价格信息'
        };
        return titles[pageName] || '详情';
    }

    getDefaultContent(pageName) {
        return `这是${this.getPageTitle(pageName)}的默认内容，点击此处开始编辑...`;
    }

    // 保持向后兼容的方法
    backToHome() {
        this.backFromSubPage('home');
    }

    backToOrder() {
        this.backFromSubPage('order');
    }
}

const pageSwitcher = new PageSwitcher();

// 阻止空白格子点击事件
document.querySelectorAll('.order-item.blank').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
    });
});
