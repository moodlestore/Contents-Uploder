/**
 * CommonModule - 공통 기능 모듈
 * 탭 전환, 설정 관리, 테마 관리, 공통 유틸리티 함수
 */
const CommonModule = {
    // 전역 변수
    currentTab: 0,
    settings: {
        imageWebhookUrl: '',
        videoWebhookUrl: '',
        nanoBananaApiKey: '',
        theme: 'default'
    },

    /**
     * 모듈 초기화
     */
    init() {
        this.loadSettings();
        this.applyTheme(this.settings.theme);
        this.addStatusMessage('시작하려면 탭을 선택하고 파일을 업로드해주세요.', 'info');
        this.setupEventListeners();
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 모달 외부 클릭 시 닫기
        window.onclick = (event) => { 
            if (event.target === document.getElementById('settingsModal')) {
                this.closeSettingsModal();
            }
        };
    },

    /**
     * 탭 전환 함수
     */
    switchTab(tabIndex) {
        // 이전 탭 비활성화
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // 새 탭 활성화
        document.querySelectorAll('.tab-button')[tabIndex].classList.add('active');
        document.querySelectorAll('.tab-content')[tabIndex].classList.add('active');

        this.currentTab = tabIndex;

        // 탭별 초기화
        switch(tabIndex) {
            case 0:
                if (typeof Tab1Module !== 'undefined') Tab1Module.init();
                break;
            case 1:
                if (typeof Tab2Module !== 'undefined') Tab2Module.init();
                break;
            case 2:
                if (typeof Tab3Module !== 'undefined') Tab3Module.init();
                break;
        }

        // 탭 변경 로그
        const tabNames = ['콘텐츠 업로드', '제품 이미지', '제품+모델 이미지'];
        this.addStatusMessage(`📂 ${tabNames[tabIndex]} 탭으로 전환되었습니다.`, 'info');
    },

    /**
     * 설정 모달 관련 함수
     */
    openSettingsModal() {
        document.getElementById('imageWebhookUrl').value = this.settings.imageWebhookUrl;
        document.getElementById('videoWebhookUrl').value = this.settings.videoWebhookUrl;
        document.getElementById('nanoBananaApiKey').value = this.settings.nanoBananaApiKey;
        this.updateThemeButtons();
        document.getElementById('settingsModal').style.display = 'block';
    },

    closeSettingsModal() {
        document.getElementById('settingsModal').style.display = 'none';
    },

    saveSettings() {
        const newSettings = {
            imageWebhookUrl: document.getElementById('imageWebhookUrl').value.trim(),
            videoWebhookUrl: document.getElementById('videoWebhookUrl').value.trim(),
            nanoBananaApiKey: document.getElementById('nanoBananaApiKey').value.trim()
        };

        // 유효성 검사
        if (this.currentTab === 0 && !newSettings.imageWebhookUrl && !newSettings.videoWebhookUrl) {
            alert('탭 1 사용을 위해서는 최소 하나의 웹훅 URL이 필요합니다.');
            return;
        }

        if ((this.currentTab === 1 || this.currentTab === 2) && !newSettings.nanoBananaApiKey) {
            alert('AI 이미지 생성 기능을 사용하려면 Nano Banana API 키가 필요합니다.');
            return;
        }

        // 설정 업데이트
        Object.assign(this.settings, newSettings);

        // 로컬 스토리지에 저장
        Object.keys(this.settings).forEach(key => {
            localStorage.setItem(key, this.settings[key]);
        });

        this.closeSettingsModal();
        
        // 성공 메시지
        const messages = [];
        if (newSettings.imageWebhookUrl) messages.push(`Image 웹훅: 설정됨`);
        if (newSettings.videoWebhookUrl) messages.push(`Video 웹훅: 설정됨`);
        if (newSettings.nanoBananaApiKey) messages.push(`Nano Banana API: 설정됨`);
        
        this.addStatusMessage(`✅ 설정이 저장되었습니다.\n${messages.join('\n')}`, 'success');

        // 탭별 설정 업데이트
        if (this.currentTab === 0 && typeof Tab1Module !== 'undefined') Tab1Module.updateSendButtons();
        if (this.currentTab === 1 && typeof Tab2Module !== 'undefined') Tab2Module.updateGenerateButton();
        if (this.currentTab === 2 && typeof Tab3Module !== 'undefined') Tab3Module.updateGenerateButton();
    },

    loadSettings() {
        Object.keys(this.settings).forEach(key => {
            const value = localStorage.getItem(key);
            if (value) this.settings[key] = value;
        });

        // 설정이 있으면 알림
        const hasSettings = this.settings.imageWebhookUrl || this.settings.videoWebhookUrl || this.settings.nanoBananaApiKey;
        if (hasSettings) {
            this.addStatusMessage('⚙️ 저장된 설정을 불러왔습니다.', 'info');
        }
    },

    /**
     * 테마 관련 함수
     */
    changeTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme(theme);
        this.updateThemeButtons();
        localStorage.setItem('theme', theme);
        
        const themeNames = {
            'default': '클래식', 'dark': '다크', 'mint': '민트', 'sunset': '선셋',
            'ocean': '오션', 'forest': '포레스트', 'rosegold': '로즈골드', 'neon': '네온',
            'cream': '크림', 'midnight': '미드나잇', 'lavender': '라벤더', 'coral': '코랄',
            'turkish': '터키시', 'golden': '골든', 'aqua': '아쿠아', 'purple': '퍼플'
        };
        
        this.addStatusMessage(`🎨 테마가 ${themeNames[theme] || theme}로 변경되었습니다.`, 'info');
    },

    applyTheme(theme) {
        if (theme === 'default') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
    },

    updateThemeButtons() {
        document.querySelectorAll('.theme-button').forEach(btn => btn.classList.remove('active'));
        
        const themeMap = {
            'default': 'theme-classic',
            'dark': 'theme-dark',
            'mint': 'theme-mint',
            'sunset': 'theme-sunset',
            'ocean': 'theme-ocean',
            'forest': 'theme-forest',
            'rosegold': 'theme-rosegold',
            'neon': 'theme-neon',
            'cream': 'theme-cream',
            'midnight': 'theme-midnight',
            'lavender': 'theme-lavender',
            'coral': 'theme-coral',
            'turkish': 'theme-turkish',
            'golden': 'theme-golden',
            'aqua': 'theme-aqua',
            'purple': 'theme-purple'
        };
        
        const activeButton = document.querySelector('.' + themeMap[this.settings.theme]);
        if (activeButton) activeButton.classList.add('active');
    },

    /**
     * 공통 유틸리티 함수
     */
    addStatusMessage(message, type = 'info') {
        const statusContent = document.getElementById('statusContent');
        const timestamp = new Date().toLocaleTimeString();
        
        // 초기 메시지 제거
        if (statusContent.innerText.includes('시작하려면') || message.includes('시작하려면')) {
            statusContent.innerHTML = '';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '15px';
        messageDiv.style.padding = '12px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.borderLeft = '4px solid ' + this.getStatusColor(type);
        messageDiv.style.backgroundColor = this.getStatusBgColor(type);
        messageDiv.style.fontSize = '0.9rem';
        messageDiv.style.lineHeight = '1.4';
        
        // 타임스탬프
        const timeSpan = document.createElement('strong');
        timeSpan.textContent = `[${timestamp}] `;
        timeSpan.style.opacity = '0.8';
        
        // 메시지 내용
        const contentSpan = document.createElement('span');
        contentSpan.innerHTML = message.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(timeSpan);
        messageDiv.appendChild(contentSpan);
        
        statusContent.prepend(messageDiv);
        
        // 자동 스크롤
        statusContent.scrollTop = 0;
    },

    getStatusColor(type) {
        switch(type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return 'var(--primary-color)';
        }
    },

    getStatusBgColor(type) {
        switch(type) {
            case 'success': return '#d4edda';
            case 'error': return '#f8d7da';
            case 'warning': return '#fff3cd';
            default: return 'var(--bg-color)';
        }
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 드래그 앤 드롭 헬퍼
     */
    setupDragAndDrop(container, callback) {
        if (!container) return;
        
        container.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            container.classList.add('dragover'); 
        });
        
        container.addEventListener('dragleave', (e) => { 
            e.preventDefault(); 
            container.classList.remove('dragover'); 
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                callback(e.dataTransfer.files[0]);
            }
        });
    },

    /**
     * API 호출 헬퍼
     */
    async makeApiCall(url, formData, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                ...options
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}\nResponse: ${responseText}`);
            }

            return {
                success: true,
                data: responseText,
                status: response.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.status || 0
            };
        }
    },

    /**
     * 디바운스 함수
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// DOM 로드 완료 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    CommonModule.init();
    
    // 첫 번째 탭(콘텐츠 업로드) 초기화
    if (typeof Tab1Module !== 'undefined') {
        Tab1Module.init();
    }
});
