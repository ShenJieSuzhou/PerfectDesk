/* 平台适配层：移植到小红书小工具时只需替换本文件中的实现 */
(function () {
  const KEY = 'perfect_workstation_save_v1';
  const Platform = {
    name: 'h5',
    load() {
      try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    },
    save(data) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
    },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} },
    vibrate(ms) { try { navigator.vibrate && navigator.vibrate(ms || 12); } catch (e) {} },
    /**
     * 分享工位图片。返回 Promise<{ok:boolean, method:string}>
     * 小红书小工具：在这里替换为平台分享/发布笔记接口。
     */
    async shareImage(blob, text) {
      const file = new File([blob], 'perfect-workstation.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: '我的完美工位', text });
          return { ok: true, method: 'system' };
        } catch (e) {
          if (e && e.name === 'AbortError') return { ok: false, method: 'cancel' };
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'perfect-workstation.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return { ok: true, method: 'download' };
    },
    async copyText(text) {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
    },
  };
  window.Platform = Platform;
})();
