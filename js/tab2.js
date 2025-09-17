/**
 * Tab2Module - 제품 이미지 편집 모듈
 * 제품 이미지를 받아서 광고 이미지로 변환하는 기능
 */
const Tab2Module = {
    // 모듈 전용 변수
    selectedFile: null,
    selectedMode: null,
    generatedImages: [],

    /**
     * 모듈 초기화
     */
    init() {
        this.reset();
        this.setupEventListeners();
        this.updateGenerateButton();
    },

    /**
     * 초기화/리셋 함수
     */
    reset() {
        this.selectedFile = null;
        this.selectedMode = null;
        this.generatedImages = [];
        
        const fileInput = document.getElementById('fileInput2');
        if (fileInput) fileInput.value = '';
        
        const mainArea = document.getElementById('mainArea2');
        const uploadContainer = document.getElementById('uploadContainer2');
        const resultImages = document.getElementById('resultImages2');
        const manualPrompt = document.getElementById('manualPrompt2');
        const promptInput = document.getElementById('promptInput2');
        
        if (mainArea) mainArea.style.display = 'none';
        if (uploadContainer) uploadContainer.style.display = 'block';
        if (resultImages) resultImages.style.display = 'none';
        if (manualPrompt) manualPrompt.classList.remove('show');
        if (promptInput) promptInput.value = '';
        
        this.clearPreview();
        this.clearModeSelection();
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const uploadContainer = document.getElementById('uploadContainer2');
        if (uploadContainer && typeof CommonModule !== 'undefined') {
            CommonModule.setupDragAndDrop(uploadContainer, (file) => {
                this.handleFile(file);
            });
        }

        // 프롬프트 입력 시 버튼 상태 업데이트
        const promptInput = document.getElementById('promptInput2');
        if (promptInput) {
            const debouncedUpdate = typeof CommonModule !== 'undefined' 
                ? CommonModule.debounce(() => this.updateGenerateButton(), 300)
                : () => this.updateGenerateButton();
            
            promptInput.addEventListener('input', debouncedUpdate);
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
        this.updateGenerateButton();
        
        if (typeof CommonModule !== 'undefined') {
            CommonModule.addStatusMessage(`📸 제품 이미지가 선택되었습니다: ${file.name} (${CommonModule.formatFileSize(file.size)})`, 'info');
        }
    },

    /**
     * 파일 유효성 검사
     */
    validateFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택해주세요.');
            return false;
        }

        // 파일 크기 검사 (50MB 제한)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('이미지 파일 크기는 50MB를 초과할 수 없습니다.');
            return false;
        }

        return true;
    },

    /**
     * 메인 영역 표시
     */
    showMainArea() {
        const uploadContainer = document.getElementById('uploadContainer2');
        const mainArea = document.getElementById('mainArea2');
        
        if (uploadContainer) uploadContainer.style.display = 'none';
        if (mainArea) mainArea.style.display = 'block';
    },

    /**
     * 미리보기 표시
     */
    showPreview(file) {
        const previewContainer = document.getElementById('previewContainer2');
        if (!previewContainer) return;

        this.clearPreview();

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-media';
            img.alt = file.name;
            previewContainer.appendChild(img);
        };
        
        reader.onerror = () => {
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage('❌ 이미지 미리보기를 생성할 수 없습니다.', 'error');
            }
        };

        reader.readAsDataURL(file);
    },

    /**
     * 미리보기 초기화
     */
    clearPreview() {
        const previewContainer = document.getElementById('previewContainer2');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
    },

    /**
     * 모드 선택 처리
     */
    selectMode(mode) {
        this.selectedMode = mode;
        this.updateModeUI(mode);
        this.updateGenerateButton();
        
        if (typeof CommonModule !== 'undefined') {
            const modeNames = { 'auto': '자동', 'manual': '수동' };
            CommonModule.addStatusMessage(`🎯 ${modeNames[mode]} 모드가 선택되었습니다.`, 'info');
        }
    },

    /**
     * 모드 UI 업데이트
     */
    updateModeUI(mode) {
        // 모드 선택 UI 업데이트
        const modeOptions = document.querySelectorAll('#tab2 .mode-option');
        modeOptions.forEach(option => option.classList.remove('selected'));

        const selectedOption = document.querySelector(`#tab2 .mode-option:${mode === 'auto' ? 'first-child' : 'last-child'}`);
        if (selectedOption) selectedOption.classList.add('selected');
        
        // 프롬프트 입력 필드 표시/숨김
        const manualPrompt = document.getElementById('manualPrompt2');
        if (manualPrompt) {
            if (mode === 'manual') {
                manualPrompt.classList.add('show');
            } else {
                manualPrompt.classList.remove('show');
                const promptInput = document.getElementById('promptInput2');
                if (promptInput) promptInput.value = '';
            }
        }
    },

    /**
     * 모드 선택 초기화
     */
    clearModeSelection() {
        const modeOptions = document.querySelectorAll('#tab2 .mode-option');
        modeOptions.forEach(option => option.classList.remove('selected'));
    },

    /**
     * 생성 버튼 상태 업데이트
     */
    updateGenerateButton() {
        const generateBtn = document.getElementById('generateBtn2');
        if (!generateBtn) return;
        
        const hasFile = !!this.selectedFile;
        const hasModeSelection = !!this.selectedMode;
        const hasApiKey = typeof CommonModule !== 'undefined' && CommonModule.settings.nanoBananaApiKey !== '';
        const hasPromptIfNeeded = this.selectedMode !== 'manual' || 
                                 (document.getElementById('promptInput2')?.value.trim() !== '');
        
        generateBtn.disabled = !(hasFile && hasModeSelection && hasApiKey && hasPromptIfNeeded);
    },

    /**
     * 이미지 생성 메인 함수
     */
    async generateImages() {
        if (!this.validateGeneration()) return;

        this.setLoadingState(true);

        try {
            const prompt = this.getGenerationPrompt();
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage(`🎨 AI 이미지 생성 시작 (${this.selectedMode === 'auto' ? '자동' : '수동'} 모드)`, 'info');
            }

            // 실제 API 호출 (현재는 시뮬레이션)
            const result = await this.callNanoBananaAPI(prompt);
            
            if (result.success) {
                this.generatedImages = result.images;
                this.displayResults(result.images);
                
                if (typeof CommonModule !== 'undefined') {
                    CommonModule.addStatusMessage('✅ 광고 이미지 2장이 생성되었습니다.', 'success');
                }
            } else {
                throw new Error(result.error || '이미지 생성에 실패했습니다.');
            }

        } catch (error) {
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage(`❌ 이미지 생성 실패: ${error.message}`, 'error');
            }
        } finally {
            this.setLoadingState(false);
        }
    },

    /**
     * 생성 유효성 검사
     */
    validateGeneration() {
        if (!this.selectedFile) {
            alert('제품 이미지를 먼저 선택해주세요.');
            return false;
        }

        if (!this.selectedMode) {
            alert('생성 모드를 선택해주세요.');
            return false;
        }

        if (typeof CommonModule === 'undefined' || !CommonModule.settings.nanoBananaApiKey) {
            alert('Nano Banana API 키가 설정되지 않았습니다.\n설정에서 API 키를 입력해주세요.');
            return false;
        }

        if (this.selectedMode === 'manual') {
            const promptInput = document.getElementById('promptInput2');
            if (!promptInput || !promptInput.value.trim()) {
                alert('수동 모드에서는 프롬프트를 입력해주세요.');
                return false;
            }
        }

        return true;
    },

    /**
     * 프롬프트 생성
     */
    getGenerationPrompt() {
        if (this.selectedMode === 'auto') {
            return 'Create a professional product advertisement image with clean background, attractive lighting, and premium presentation style. Make the product the main focus with elegant composition and commercial appeal.';
        } else {
            const promptInput = document.getElementById('promptInput2');
            return promptInput ? promptInput.value.trim() : '';
        }
    },

    /**
     * Nano Banana API 호출 (임시 시뮬레이션)
     */
    async callNanoBananaAPI(prompt) {
        // 실제 API 호출로 교체 예정
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    images: [
                        'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Generated+Ad+1',
                        'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Generated+Ad+2'
                    ]
                });
            }, 3000);
        });
    },

    /**
     * 결과 이미지 표시
     */
    displayResults(imageUrls) {
        const resultContainer = document.getElementById('resultImages2');
        if (!resultContainer) return;

        resultContainer.innerHTML = '';
        
        imageUrls.forEach((url, index) => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-image';
            
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Generated Product Ad ${index + 1}`;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '200px';
            img.style.borderRadius = '8px';
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn btn-secondary download-btn';
            downloadBtn.innerHTML = '💾 다운로드';
            downloadBtn.onclick = () => this.downloadImage(url, index + 1);
            
            resultDiv.appendChild(img);
            resultDiv.appendChild(downloadBtn);
            resultContainer.appendChild(resultDiv);
        });
        
        resultContainer.style.display = 'grid';
    },

    /**
     * 이미지 다운로드
     */
    async downloadImage(url, index) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `product_ad_${index}_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage(`💾 이미지 ${index}를 다운로드했습니다.`, 'info');
            }
        } catch (error) {
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage(`❌ 다운로드 실패: ${error.message}`, 'error');
            }
        }
    },

    /**
     * 로딩 상태 설정
     */
    setLoadingState(isLoading) {
        const loading = document.getElementById('loading2');
        const generateBtn = document.getElementById('generateBtn2');
        
        if (loading) {
            loading.style.display = isLoading ? 'block' : 'none';
        }
        
        if (generateBtn) {
            generateBtn.disabled = isLoading;
            if (isLoading) {
                generateBtn.innerHTML = '🎨 생성 중...';
            } else {
                generateBtn.innerHTML = '🎨 광고 이미지 생성';
                this.updateGenerateButton();
            }
        }
    },

    /**
     * 모듈 상태 정보 반환
     */
    getStatus() {
        return {
            hasFile: !!this.selectedFile,
            fileName: this.selectedFile ? this.selectedFile.name : null,
            selectedMode: this.selectedMode,
            hasPrompt: this.selectedMode === 'manual' ? 
                      !!document.getElementById('promptInput2')?.value.trim() : true,
            generatedCount: this.generatedImages.length
        };
    }
};
