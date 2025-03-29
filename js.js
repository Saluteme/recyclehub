class PageSwitcher {
    constructor() {
        // 获取所有页面元素
        this.pages = Array.from(document.querySelectorAll('.page'));
        // 获取底部导航图标
        this.footerIcons = document.querySelectorAll('footer .icon');
        // 当前活动页面索引
        this.currentIndex = 0;
        // 触摸起始坐标
        this.startX = 0;
        // 动画状态锁
        this.isAnimating = false;
        // 主页面列表
        this.mainPages = ['home', 'order', 'add', 'switch', 'user'];
        // 子页面列表
        this.subPages = ['energy', 'price', 'recycle', 'official'];

        // 初始化操作
        this.init();
        this.isInitialized = false;
        
    }

    init() {
        this.disableTransitions();
        this.initPagesPosition();

        // 初始化完成后移除 loading 类
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
        // 禁用过渡效果用于初始化
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
        this.pages.forEach((page, index) => {
            page.style.willChange = 'transform, opacity';
            if (page.dataset.page === 'home') {
                page.style.transform = 'translateX(0)';
                page.style.opacity = '1';
                page.style.pointerEvents = 'auto';
                page.classList.add('active');
            } else {
                page.style.transform = 'translateX(100%)';
                page.style.opacity = '0';
                page.style.pointerEvents = 'none';
                page.classList.remove('active');
            }
        });
    }

    initSubPages() {
        // 初始化子页面：添加返回按钮和默认内容
        this.subPages.forEach(pageName => {
            const page = this.pages.find(p => p.dataset.page === pageName);
            if (page) {
                // 清除旧按钮防止重复
                const existingBtn = page.querySelector('.back-button');
                if (existingBtn) existingBtn.remove();

                // 创建返回按钮
                const backBtn = document.createElement('button');
                backBtn.className = 'back-button';
                backBtn.textContent = '← 返回订单';
                backBtn.addEventListener('click', () => this.backToOrder());
                page.insertAdjacentElement('afterbegin', backBtn);

                // 初始化可编辑内容
                const content = page.querySelector('.editable-content');
                if (!content.innerHTML.trim()) {
                    content.innerHTML = `
                        <h2>${this.getPageTitle(pageName)}详情</h2>
                        <p>${this.getDefaultContent(pageName)}</p>
                    `;
                }
            }
        });
    }

    initEvents() {
        // 触摸事件处理
        document.addEventListener('touchstart', e => {
            if (!this.isAnimating) this.startX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', e => {
            if (this.isAnimating || !this.startX) return;

            const endX = e.changedTouches[0].clientX;
            const deltaX = endX - this.startX;
            const threshold = 50;

            // 滑动超过阈值触发页面切换
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

        // 订单项点击事件（使用事件委托）
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
      
        this.isAnimating = true;
        const currentPage = this.pages[this.currentIndex];
        const newPage = this.pages[newIndex];
      
        newPage.style.transform = direction === 'left' 
            ? 'translateX(100%)' 
            : 'translateX(-100%)';
        newPage.style.opacity = '1';
        newPage.style.pointerEvents = 'auto';
      
        requestAnimationFrame(() => {
            currentPage.style.transform = direction === 'left' 
                ? 'translateX(-100%)' 
                : 'translateX(100%)';
            currentPage.style.opacity = '0';
      
            newPage.style.transform = 'translateX(0)';
      
            setTimeout(() => {
                currentPage.classList.remove('active');
                newPage.classList.add('active');
                this.currentIndex = newIndex;
                this.isAnimating = false;
                this.updateFooter();
            }, 400);
        });
      }

      switchToSubPage(pageName) {
        const targetPage = this.pages.find(p => p.dataset.page === pageName);
        if (!targetPage || this.isAnimating) return;
      
        this.isAnimating = true;
        targetPage.style.transform = 'translateX(0)';
        targetPage.style.opacity = '1';
        targetPage.style.pointerEvents = 'auto';
        targetPage.classList.add('sub-active');
      
        setTimeout(() => this.isAnimating = false, 400);
      }

      backToOrder() {
        const currentSubPage = document.querySelector('.page.sub-active');
        if (!currentSubPage || this.isAnimating) return;
      
        this.isAnimating = true;
        currentSubPage.style.transform = 'translateX(100%)';
        currentSubPage.style.opacity = '0';
        currentSubPage.style.pointerEvents = 'none';
        currentSubPage.classList.remove('sub-active');
      
        const orderPage = this.pages[this.mainPages.indexOf('order')];
        orderPage.style.transform = 'translateX(0)';
        orderPage.style.opacity = '1';
      
        setTimeout(() => {
            this.currentIndex = this.mainPages.indexOf('order');
            this.isAnimating = false;
            this.updateFooter();
        }, 400);
      }

    updateFooter() {
        // 更新底部导航状态
        this.footerIcons.forEach((icon, index) => {
            const isActive = index === this.currentIndex;
            icon.classList.toggle('active', isActive);
            const img = icon.querySelector('img');
            if (img) img.style.transform = isActive ? 'scale(1.1)' : '';
        });
    }

    resetMainPages() {
        // 重置非活动主页面位置
        this.pages.forEach((page, index) => {
            if (index !== this.currentIndex && this.mainPages.includes(page.dataset.page)) {
                page.style.transform = index > this.currentIndex
                   ? 'translateX(100%)'
                    : 'translateX(-100%)';
                page.style.opacity = 0;
                page.style.visibility = 'hidden';
            }
        });
    }

    // 辅助方法
    getPageTitle(pageName) {
        const titles = {
            energy: '能量任务',
            price: '价格回收',
            recycle: '回收站',
            official: '官方任务'
        };
        return titles[pageName] || '详情';
    }

    getDefaultContent(pageName) {
        return `这是${this.getPageTitle(pageName)}的默认内容，点击此处开始编辑...`;
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