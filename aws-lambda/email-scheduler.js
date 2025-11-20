/**
 * AWS Lambda 함수: 이메일 발송 스케줄러
 * 
 * EventBridge (CloudWatch Events)에서 매일 오전 09:00 (KST)에 호출
 * 
 * 배포 방법:
 * 1. AWS Lambda 콘솔에서 새 함수 생성
 * 2. Node.js 런타임 선택 (18.x 이상)
 * 3. 이 코드를 복사하여 붙여넣기
 * 4. 환경 변수 설정:
 *    - EMAIL_API_KEY: Amplify 앱의 EMAIL_API_KEY와 동일
 *    - AMPLIFY_API_URL: https://your-app.amplifyapp.com/api/email/cron
 * 5. EventBridge 규칙 생성:
 *    - Schedule expression: cron(0 0 * * ? *) (UTC 00:00 = KST 09:00)
 *    - Target: 이 Lambda 함수
 */

const https = require('https');
const http = require('http');

exports.handler = async (event) => {
    const apiKey = process.env.EMAIL_API_KEY;
    const apiUrl = process.env.AMPLIFY_API_URL;
    
    if (!apiKey || !apiUrl) {
        console.error('환경 변수가 설정되지 않았습니다:', {
            hasApiKey: !!apiKey,
            hasApiUrl: !!apiUrl
        });
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: '환경 변수 설정 오류'
            })
        };
    }
    
    console.log('이메일 발송 Lambda 함수 실행:', {
        timestamp: new Date().toISOString(),
        apiUrl: apiUrl.replace(/\/[^\/]*$/, '/***') // URL 마스킹
    });
    
    try {
        const url = new URL(apiUrl);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'User-Agent': 'AWS-Lambda-Email-Scheduler'
            },
            timeout: 30000 // 30초 타임아웃
        };
        
        return new Promise((resolve, reject) => {
            const req = client.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    };
                    
                    console.log('API 응답:', {
                        statusCode: res.statusCode,
                        bodyLength: data.length
                    });
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({
                            statusCode: 200,
                            body: JSON.stringify({
                                success: true,
                                message: '이메일 발송 작업이 시작되었습니다.',
                                apiResponse: JSON.parse(data)
                            })
                        });
                    } else {
                        resolve({
                            statusCode: res.statusCode,
                            body: JSON.stringify({
                                success: false,
                                error: `API 응답 오류: ${res.statusCode}`,
                                apiResponse: data
                            })
                        });
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('요청 오류:', error);
                reject({
                    statusCode: 500,
                    body: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject({
                    statusCode: 504,
                    body: JSON.stringify({
                        success: false,
                        error: '요청 타임아웃'
                    })
                });
            });
            
            req.end();
        });
    } catch (error) {
        console.error('Lambda 함수 실행 오류:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

