/**
 * Tab1Module - 콘텐츠 업로드 모듈
 * 기존 웹훅 기반 파일 전송 기능
 */
const Tab1Module = {
    // 모듈 전용 변수
    selectedFile: null,

    /**
     * 모듈 초기화
     */
    init() {
        this.reset();
        this.setupEventListeners();
        this.updateSendButtons();
    },

    /**
     * 초기화/리셋 함수
     */
    reset() {
        this.selectedFile = null;
        const fileInput = document.getElementById('fileInput1');
        if (fileInput) fileInput.value = '';
        
        const mainArea = document.getElementById('mainArea1');
        const uploadContainer = document.getElementById('uploadContainer1');
        
        if (mainArea) mainArea.style.display = 'none';
        if (uploadContainer) uploadContainer.style.display = 'block';
        
        this.clearPreview();
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const uploadContainer = document.getElementById('uploadContainer1');
        if (uploadContainer && typeof CommonModule !== 'undefined') {
            CommonModule.setupDragAndDrop(uploadContainer, (file) => {
                this.handleFile(file);
            });
        }
    },

    /**
     * 파일 선택 핸들러
     */
    handleFileSelect(event) {
        if (event.target.files.length > 0) {
            this.handleFile(event.target.files[0]);
        }
    },

    /**
     * 파일 처리 메인 함수
     */
    handleFile(file) {
        if (!this.validateFile(file)) return;

        this.selectedFile = file;
        this.showMainArea();
        this.showPreview(file);
        this.updateSendButtons();
        
        if (typeof CommonModule !== 'undefined') {
            CommonModule.addStatusMessage(`📁 파일이 선택되었습니다: ${file.name} (${CommonModule.formatFileSize(file.size)})`, 'info');
        }
    },

    /**
     * 파일 유효성 검사
     */
    validateFile(file) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            alert('이미지 또는 영상 파일만 선택해주세요.');
            return false;
        }

        // 파일 크기 검사 (100MB 제한)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('파일 크기는 100MB를 초과할 수 없습니다.');
            return false;
        }

        return true;
    },

    /**
     * 메인 영역 표시
     */
    showMainArea() {
        const uploadContainer = document.getElementById('uploadContainer1');
        const mainArea = document.getElementById('mainArea1');
        
        if (uploadContainer) uploadContainer.style.display = 'none';
        if (mainArea) mainArea.style.display = 'block';
    },

    /**
     * 미리보기 표시
     */
    showPreview(file) {
        const previewContainer = document.getElementById('previewContainer1');
        if (!previewContainer) return;

        this.clearPreview();

        const reader = new FileReader();
        reader.onload = (e) => {
            let mediaElement;
            
            if (file.type.startsWith('image/')) {
                mediaElement = document.createElement('img');
                mediaElement.alt = file.name;
            } else if (file.type.startsWith('video/')) {
                mediaElement = document.createElement('video');
                mediaElement.controls = true;
            }

            if (mediaElement) {
                mediaElement.src = e.target.result;
                mediaElement.className = 'preview-media';
                previewContainer.appendChild(mediaElement);
            }
        };
        
        reader.onerror = () => {
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage('❌ 파일 미리보기를 생성할 수 없습니다.', 'error');
            }
        };

        reader.readAsDataURL(file);
    },

    /**
     * 미리보기 초기화
     */
    clearPreview() {
        const previewContainer = document.getElementById('previewContainer1');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
    },

    /**
     * 전송 버튼 상태 업데이트
     */
    updateSendButtons() {
        const sendButtons = document.querySelectorAll('#tab1 .send-buttons-grid .btn');
        
        if (!this.selectedFile || typeof CommonModule === 'undefined') {
            sendButtons.forEach(btn => btn.disabled = true);
            return;
        }

        const isImage = this.selectedFile.type.startsWith('image/');
        const isVideo = this.selectedFile.type.startsWith('video/');
        const { imageWebhookUrl, videoWebhookUrl } = CommonModule.settings;

        sendButtons.forEach(button => {
            const buttonType = button.dataset.type;
            const isImageButton = buttonType.includes('image');
            const isVideoButton = buttonType.includes('video');
            
            // 파일 타입과 웹훅 URL 매칭 확인
            if (isImage && isImageButton && imageWebhookUrl) {
                button.disabled = false;
            } else if (isVideo && isVideoButton && videoWebhookUrl) {
                button.disabled = false;
            } else {
                button.disabled = true;
            }
        });
    },

    /**
     * 전송 확인
     */
    confirmSend(type, buttonText) {
        if (!this.selectedFile) {
            alert('파일을 먼저 선택해주세요.');
            return;
        }
        
        const confirmed = confirm(
            `${buttonText} 타입으로 "${this.selectedFile.name}" 파일을 전송하시겠습니까?\n\n` +
            `파일 크기: ${typeof CommonModule !== 'undefined' ? CommonModule.formatFileSize(this.selectedFile.size) : '알 수 없음'}`
        );
        
        if (confirmed) {
            this.sendData(type);
        }
    },

    /**
     * 데이터 전송 메인 함수
     */
    async sendData(type) {
        if (!this.selectedFile || typeof CommonModule === 'undefined') return;

        const isImage = type.includes('image');
        const webhookUrl = isImage ? CommonModule.settings.imageWebhookUrl : CommonModule.settings.videoWebhookUrl;

        if (!webhookUrl) {
            alert(`${isImage ? 'Image' : 'Video'} 웹훅 URL이 설정되지 않았습니다.\n설정에서 웹훅 URL을 입력해주세요.`);
            return;
        }

        this.setLoadingState(true);

        try {
            const formData = this.prepareFormData(type);
            CommonModule.addStatusMessage(`📤 전송 시작: ${this.selectedFile.name} (타입: ${type})`, 'info');

            const result = await CommonModule.makeApiCall(webhookUrl, formData);

            if (result.success) {
                CommonModule.addStatusMessage(`✅ 전송 성공\n응답: ${result.data}`, 'success');
                this.handleSuccessfulSend();
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            CommonModule.addStatusMessage(`❌ 전송 실패: ${error.message}`, 'error');
        } finally {
            this.setLoadingState(false);
        }
    },

    /**
     * FormData 준비
     */
    prepareFormData(type) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('filename', this.selectedFile.name);
        formData.append('type', type);
        formData.append('timestamp', new Date().toISOString());
        formData.append('filesize', this.selectedFile.size.toString());
        formData.append('filetype', this.selectedFile.type);
        
        return formData;
    },

    /**
     * 성공 후 처리
     */
    handleSuccessfulSend() {
        // 2초 후에 UI 초기화
        setTimeout(() => {
            this.reset();
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage('🔄 새 파일을 업로드할 준비가 완료되었습니다.', 'info');
            }
        }, 2000);
    },

    /**
     * 로딩 상태 설정
     */
    setLoadingState(isLoading) {
        const loading = document.getElementById('loading1');
        const sendButtons = document.querySelectorAll('#tab1 .send-buttons-grid .btn');
        
        if (loading) {
            loading.style.display = isLoading ? 'block' : 'none';
        }
        
        sendButtons.forEach(btn => {
            btn.disabled = isLoading;
        });
    },

    /**
     * 모듈 상태 정보 반환
     */
    getStatus() {
        return {
            hasFile: !!this.selectedFile,
            fileName: this.selectedFile ? this.selectedFile.name : null,
            fileSize: this.selectedFile ? this.selectedFile.size : null,
            fileType: this.selectedFile ? this.selectedFile.type : null
        };
    }
};
