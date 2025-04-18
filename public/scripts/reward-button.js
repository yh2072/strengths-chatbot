(function() {
  function observeMessages() {
    // 观察DOM变化，寻找练习完成消息
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // 检查所有新添加的节点
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 找到所有包含完成消息的元素
              const completionElements = node.querySelectorAll('.fixed.bottom-24.right-6, .fixed.right-6');
              if (completionElements.length > 0) {
                completionElements.forEach(processCompletionElement);
              } else {
                // 也查找文本节点中的完成消息
                const textNodes = getAllTextNodes(node);
                textNodes.forEach(processTextNode);
              }
            }
          });
        }
      });
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function getAllTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    return textNodes;
  }

  function processTextNode(textNode) {
    // 检查是否包含完成练习的文本
    if (textNode.textContent.includes('恭喜完成练习') || 
        textNode.textContent.includes('获得50积分奖励')) {
      
      // 获取当前页面的练习ID
      const exerciseId = getExerciseIdFromURL();
      if (!exerciseId) return;
      
      // 找到包含文本节点的父元素
      let parentElement = textNode.parentNode;
      
      // 创建领取奖励按钮
      const rewardButton = createRewardButton(exerciseId);
      
      // 替换消息为按钮
      try {
        // 尝试替换整个消息容器
        if (parentElement.classList.contains('fixed') || 
            parentElement.parentNode.classList.contains('fixed')) {
          const container = parentElement.classList.contains('fixed') ? 
            parentElement : parentElement.parentNode;
          
          container.innerHTML = '';
          container.appendChild(rewardButton);
        } else {
          // 在文本节点后插入按钮
          textNode.replaceWith(rewardButton);
        }
        
        console.log('已将完成消息替换为领取奖励按钮');
      } catch (e) {
        console.error('替换完成消息失败:', e);
      }
    }
  }

  function processCompletionElement(element) {
    // 检查元素内容是否包含完成练习的文本
    if (element.textContent.includes('恭喜完成练习') || 
        element.textContent.includes('获得积分奖励')) {
      
      // 获取当前页面的练习ID
      const exerciseId = getExerciseIdFromURL();
      if (!exerciseId) return;
      
      // 创建领取奖励按钮容器
      const buttonContainer = document.createElement('div');
      buttonContainer.className = element.className; // 保持原样式
      buttonContainer.innerHTML = `
        <div class="text-center">
          <p class="font-bold mb-2">练习已完成! 🎉</p>
          <a 
            href="/exercises/claim-reward?id=${exerciseId}"
            class="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            领取奖励
          </a>
        </div>
      `;
      
      // 替换原元素
      element.replaceWith(buttonContainer);
      console.log('已替换练习完成提示为领取奖励按钮');
    }
  }

  function createRewardButton(exerciseId) {
    // 创建按钮容器
    const container = document.createElement('div');
    container.className = 'fixed bottom-24 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50';
    
    // 设置按钮内容
    container.innerHTML = `
      <div class="text-center">
        <p class="font-bold mb-2">练习已完成! 🎉</p>
        <a 
          href="/exercises/claim-reward?id=${exerciseId}"
          class="inline-block px-4 py-2 bg-white text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition"
        >
          领取奖励
        </a>
      </div>
    `;
    
    return container;
  }

  function getExerciseIdFromURL() {
    // 从URL中提取练习ID
    const path = window.location.pathname;
    const matches = path.match(/\/exercises\/([^\/]+)\/chat/);
    return matches ? matches[1] : null;
  }

  // 页面加载完成后开始观察
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeMessages);
  } else {
    observeMessages();
  }
})(); 