/**
 * Tab3Module - 제품+모델 이미지 편집 모듈
 * 제품 이미지와 모델 이미지를 조합하여 광고 이미지를 생성하는 기능
 */
const Tab3Module = {
    // 모듈 전용 변수
    productFile: null,
    modelFile: null,
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
        this.productFile = null;
        this.modelFile = null;
        this.generatedImages = [];
        
        const fileInputs = ['fileInput3a', 'fileInput3b'];
        fileInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        const mainArea = document.getElementById('mainArea3');
        const uploadContainers = ['uploadContainer3a', 'uploadContainer3b'];
        const resultImages = document.getElementById('resultImages3');
        const promptInput = document.getElementById('promptInput3');
        
        if (mainArea) mainArea.style.display = 'none';
        uploadContainers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.style.display = 'block';
        });
        if (resultImages) resultImages.style.display = 'none';
        if (promptInput) promptInput.value = '';
        
        this.clearPreviews();
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 제품 이미지 드래그 앤 드롭
        const productContainer = document.getElementById('uploadContainer3a');
        if (productContainer && typeof CommonModule !== 'undefined') {
            CommonModule.setupDragAndDrop(productContainer, (file) => {
                this.handleFile(file, 'product');
            });
        }

        // 모델 이미지 드래그 앤 드롭
        const modelContainer = document.getElementById('uploadContainer3b');
        if (modelContainer && typeof CommonModule !== 'undefined') {
            CommonModule.setupDragAndDrop(modelContainer, (file) => {
                this.handleFile(file, 'model');
            });
        }

        // 프롬프트 입력 시 버튼 상태 업데이트
        const promptInput = document.getElementById('promptInput3');
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
    handleFileSelect(event, type) {
        if (event.target.files.length > 0) {
            this.handleFile(event.target.files[0], type);
        }
    },

    /**
     * 파일 처리 메인 함수
     */
    handleFile(file, type) {
        if (!this.validateFile(file, type)) return;

        if (type === 'product') {
            this.productFile = file;
            this.showPreview(file, 'previewContainer3a');
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage(`📸 제품 이미지가 선택되었습니다: ${file.name} (${CommonModule.formatFileSize(file.size)})`, 'info');
            }
        } else if (type === 'model') {
            this.modelFile = file;
            this.showPreview(file, 'previewContainer3b');
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage(`👤 모델 이미지가 선택되었습니다: ${file.name} (${CommonModule.formatFileSize(file.size)})`, 'info');
            }
        }

        this.updateUI();
        this.updateGenerateButton();
    },

    /**
     * 파일 유효성 검사
     */
    validateFile(file, type) {
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

        // 이미지 형식 검사
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('JPEG, PNG, WebP 형식의 이미지만 지원됩니다.');
            return false;
        }

        return true;
    },

    /**
     * 미리보기 표시
     */
    showPreview(file, containerId) {
        const previewContainer = document.getElementById(containerId);
        if (!previewContainer) return;

        previewContainer.innerHTML = '';

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
                CommonModule.addStatusMessage(`❌ ${containerId.includes('3a') ? '제품' : '모델'} 이미지 미리보기를 생성할 수 없습니다.`, 'error');
            }
        };

        reader.readAsDataURL(file);
    },

    /**
     * 미리보기 초기화
     */
    clearPreviews() {
        const previewContainers = ['previewContainer3a', 'previewContainer3b'];
        previewContainers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.innerHTML = '';
        });
    },

    /**
     * UI 업데이트
     */
    updateUI() {
        const hasFiles = this.productFile && this.modelFile;
        const mainArea = document.getElementById('mainArea3');
        
        if (mainArea) {
            mainArea.style.display = hasFiles ? 'block' : 'none';
        }

        if (hasFiles && typeof CommonModule !== 'undefined') {
            CommonModule.addStatusMessage('✅ 제품과 모델 이미지가 모두 준비되었습니다. 프롬프트를 입력해주세요.', 'info');
        }
    },

    /**
     * 생성 버튼 상태 업데이트
     */
    updateGenerateButton() {
        const generateBtn = document.getElementById('generateBtn3');
        if (!generateBtn) return;
        
        const hasFiles = !!(this.productFile && this.modelFile);
        const hasPrompt = !!document.getElementById('promptInput3')?.value.trim();
        const hasApiKey = typeof CommonModule !== 'undefined' && CommonModule.settings.nanoBananaApiKey !== '';
        
        generateBtn.disabled = !(hasFiles && hasPrompt && hasApiKey);
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
                CommonModule.addStatusMessage('🎨 제품+모델 광고 이미지 생성 시작', 'info');
            }

            // 실제 API 호출 (현재는 시뮬레이션)
            const result = await this.callNanoBananaAPI(prompt);
            
            if (result.success) {
                this.generatedImages = result.images;
                this.displayResults(result.images);
                
                if (typeof CommonModule !== 'undefined') {
                    CommonModule.addStatusMessage('✅ 모델 제품 광고 이미지 2장이 생성되었습니다.', 'success');
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
        if (!this.productFile) {
            alert('제품 이미지를 먼저 선택해주세요.');
            return false;
        }

        if (!this.modelFile) {
            alert('모델 이미지를 먼저 선택해주세요.');
            return false;
        }

        if (typeof CommonModule === 'undefined' || !CommonModule.settings.nanoBananaApiKey) {
            alert('Nano Banana API 키가 설정되지 않았습니다.\n설정에서 API 키를 입력해주세요.');
            return false;
        }

        const promptInput = document.getElementById('promptInput3');
        if (!promptInput || !promptInput.value.trim()) {
            alert('광고 시나리오 프롬프트를 입력해주세요.\n예: "모델이 제품을 자연스럽게 소개하는 모습으로..."');
            return false;
        }

        return true;
    },

    /**
     * 프롬프트 생성
     */
    getGenerationPrompt() {
        const promptInput = document.getElementById('promptInput3');
        const userPrompt = promptInput ? promptInput.value.trim() : '';
        
        // 기본 프롬프트와 사용자 프롬프트 조합
        const basePrompt = 'Create a professional advertisement image combining a product and model. ';
        return basePrompt + userPrompt;
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
                        'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Model+Product+Ad+1',
                        'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Model+Product+Ad+2'
                    ]
                });
            }, 4000);
        });
    },

    /**
     * 결과 이미지 표시
     */
    displayResults(imageUrls) {
        const resultContainer = document.getElementById('resultImages3');
        if (!resultContainer) return;

        resultContainer.innerHTML = '';
        
        imageUrls.forEach((url, index) => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-image';
            
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Generated Model Product Ad ${index + 1}`;
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
            link.download = `model_product_ad_${index}_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.addStatusMessage(`💾 모델 제품 광고 이미지 ${index}를 다운로드했습니다.`, 'info');
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
        const loading = document.getElementById('loading3');
        const generateBtn = document.getElementById('generateBtn3');
        
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
     * 파일 타입 검증 헬퍼
     */
    getImageInfo(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight
                });
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('이미지 정보를 읽을 수 없습니다.'));
            };
            
            img.src = url;
        });
    },

    /**
     * 모듈 상태 정보 반환
     */
    getStatus() {
        return {
            hasProductFile: !!this.productFile,
            hasModelFile: !!this.modelFile,
            productFileName: this.productFile ? this.productFile.name : null,
            modelFileName: this.modelFile ? this.modelFile.name : null,
            hasPrompt: !!document.getElementById('promptInput3')?.value.trim(),
            generatedCount: this.generatedImages.length
        };
    },

    /**
     * 고급 설정 (향후 확장용)
     */
    getAdvancedSettings() {
        return {
            imageQuality: 'high',
            outputFormat: 'png',
            aspectRatio: '16:9',
            style: 'commercial'
        };
    }
};
