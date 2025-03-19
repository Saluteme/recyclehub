class PageSwitcher {
  constructor() {
      this.pages = Array.from(document.querySelectorAll('.page'));
      this.footerIcons = document.querySelectorAll('footer .icon');
      this.currentIndex = 0;
      this.startX = 0;
      this.isAnimating = false;
      this.init();
  }

  init() {
      this.disableTransitions();
      this.initPagesPosition();
      this.enableTransitions();
      this.initEvents();
      this.updateFooter();
  }

  disableTransitions() {
      this.pages.forEach(page => {
          page.style.transition = 'none';
      });
  }

  enableTransitions() {
      requestAnimationFrame(() => {
          this.pages.forEach(page => {
              page.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease';
          });
      });
  }

  initPagesPosition() {
      this.pages.forEach((page, index) => {
          page.style.willChange = 'transform, opacity';
          page.style.opacity = index === 0 ? 1 : 0;
          page.style.transform = index === 0 ? 'translateX(0)' : 
              (index > 0 ? 'translateX(100%)' : 'translateX(-100%)');
          page.classList.toggle('active', index === 0);
      });
  }

  initEvents() {
      // 触摸事件
      document.addEventListener('touchstart', e => {
          if (this.isAnimating) e.preventDefault();
          this.startX = e.touches[0].clientX;
      }, { passive: false });

      document.addEventListener('touchend', e => {
          if (this.isAnimating) return;

          const endX = e.changedTouches[0].clientX;
          const deltaX = endX - this.startX;
          const threshold = 50;

          if (Math.abs(deltaX) > threshold) {
              const direction = deltaX > 0 ? 'right' : 'left';
              const newIndex = direction === 'right' 
                  ? Math.max(0, this.currentIndex - 1)
                  : Math.min(this.pages.length - 1, this.currentIndex + 1);

              this.switchTo(newIndex, direction);
          }
      });

      // 图标点击事件
      this.footerIcons.forEach((icon, footerIndex) => {
          icon.addEventListener('click', e => {
              e.preventDefault();
              const pageIndex = this.getPageIndex(footerIndex);
              if (pageIndex !== this.currentIndex) {
                  const direction = pageIndex > this.currentIndex ? 'left' : 'right';
                  this.switchTo(pageIndex, direction);
              }
          });
      });
  }

  switchTo(newIndex, direction) {
      if (newIndex === this.currentIndex || newIndex < 0 || newIndex >= this.pages.length) return;

      this.isAnimating = true;
      const currentPage = this.pages[this.currentIndex];
      const newPage = this.pages[newIndex];

      // 设置新页面初始位置
      newPage.style.transform = direction === 'left' 
          ? 'translateX(100%)' 
          : 'translateX(-100%)';
      newPage.style.opacity = 1;
      newPage.classList.add('active');

      requestAnimationFrame(() => {
          currentPage.style.transform = direction === 'left' 
              ? 'translateX(-100%)' 
              : 'translateX(100%)';
          
          newPage.style.transform = 'translateX(0)';

          setTimeout(() => {
              currentPage.classList.remove('active');
              this.currentIndex = newIndex;
              this.isAnimating = false;
              this.updateFooter();
              this.resetOtherPages();
          }, 300);
      });
  }

  updateFooter() {
      this.footerIcons.forEach((icon, footerIndex) => {
          const isActive = this.getPageIndex(footerIndex) === this.currentIndex;
          icon.classList.toggle('active', isActive);
          icon.querySelector('img').style.transform = isActive ? 'scale(1.1)' : '';
      });
  }

  resetOtherPages() {
      this.pages.forEach((page, index) => {
          if (index !== this.currentIndex) {
              page.style.transform = index > this.currentIndex 
                  ? 'translateX(100%)' 
                  : 'translateX(-100%)';
              page.style.opacity = 0;
          }
      });
  }

  getPageIndex(footerIndex) {
      // 页面索引与footer图标索引一一对应
      return Math.min(footerIndex, this.pages.length - 1);
  }
}

new PageSwitcher();