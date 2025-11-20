/**
 * 이메일 HTML 템플릿
 */

import { Post, UserEmail } from './types';

/**
 * 이메일 HTML 템플릿 생성
 */
export function generateEmailHTML(user: UserEmail, posts: Post[]): string {
  const date = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const postsHTML = posts.length > 0
    ? posts.map((post, index) => generatePostHTML(post, index + 1)).join('')
    : '<div style="padding: 20px; text-align: center; color: #666;">오늘은 새로운 게시물이 없습니다.</div>';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>일일 뉴스레터</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                📬 일일 뉴스레터
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                ${date}
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                안녕하세요, <strong>${user.name}</strong>님!<br>
                오늘 하루 새로 올라온 게시물을 정리해드립니다.
              </p>
            </td>
          </tr>
          
          <!-- Posts Count -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #495057; font-size: 14px;">
                  <strong>총 ${posts.length}개의 게시물</strong>이 있습니다.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Posts List -->
          <tr>
            <td style="padding: 0 40px 30px;">
              ${postsHTML}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 12px; text-align: center;">
                이 이메일은 자동으로 발송되었습니다.
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                구독 설정을 변경하려면 <a href="#" style="color: #667eea; text-decoration: none;">설정 페이지</a>를 방문해주세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 개별 게시물 HTML 생성
 */
function generatePostHTML(post: Post, index: number): string {
  const matchedKeywordsBadges = post.matchedKeywords.length > 0
    ? post.matchedKeywords.map(keyword => `
        <span style="display: inline-block; background-color: #667eea; color: #ffffff; font-size: 11px; padding: 4px 8px; border-radius: 4px; margin-right: 4px; margin-bottom: 4px;">
          ${keyword}
        </span>
      `).join('')
    : '';

  const isNewBadge = post.isNew
    ? '<span style="display: inline-block; background-color: #dc3545; color: #ffffff; font-size: 11px; padding: 4px 8px; border-radius: 4px; margin-right: 4px;">NEW</span>'
    : '';

  return `
<div style="margin-bottom: 30px; padding: 20px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; border-left: 4px solid #667eea;">
  <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 12px;">
    <div style="flex: 1;">
      <div style="margin-bottom: 8px;">
        ${isNewBadge}
        <span style="display: inline-block; background-color: #f8f9fa; color: #495057; font-size: 11px; padding: 4px 8px; border-radius: 4px;">
          ${post.board}
        </span>
      </div>
      <h3 style="margin: 0 0 10px; color: #212529; font-size: 18px; font-weight: 600; line-height: 1.4;">
        ${post.title}
      </h3>
    </div>
    <span style="color: #6c757d; font-size: 12px; white-space: nowrap; margin-left: 10px;">
      #${index}
    </span>
  </div>
  
  <p style="margin: 0 0 12px; color: #495057; font-size: 14px; line-height: 1.6;">
    ${post.summary}
  </p>
  
  ${matchedKeywordsBadges ? `
  <div style="margin-bottom: 12px;">
    ${matchedKeywordsBadges}
  </div>
  ` : ''}
  
  <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d;">
    <div>
      <span>작성자: ${post.author}</span>
      <span style="margin: 0 8px;">|</span>
      <span>${post.date}</span>
      <span style="margin: 0 8px;">|</span>
      <span>조회수: ${post.views}</span>
    </div>
    ${post.url ? `
    <a href="${post.url}" style="color: #667eea; text-decoration: none; font-weight: 500;">
      자세히 보기 →
    </a>
    ` : ''}
  </div>
</div>
  `.trim();
}

/**
 * 텍스트 버전 이메일 생성 (fallback용)
 */
export function generateEmailText(user: UserEmail, posts: Post[]): string {
  const date = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  let text = `일일 뉴스레터\n`;
  text += `${date}\n\n`;
  text += `안녕하세요, ${user.name}님!\n`;
  text += `오늘 하루 새로 올라온 게시물을 정리해드립니다.\n\n`;
  text += `총 ${posts.length}개의 게시물이 있습니다.\n\n`;

  if (posts.length === 0) {
    text += `오늘은 새로운 게시물이 없습니다.\n`;
  } else {
    posts.forEach((post, index) => {
      text += `[${index + 1}] ${post.board} - ${post.title}\n`;
      text += `${post.summary}\n`;
      if (post.matchedKeywords.length > 0) {
        text += `매칭 키워드: ${post.matchedKeywords.join(', ')}\n`;
      }
      text += `작성자: ${post.author} | ${post.date} | 조회수: ${post.views}\n`;
      if (post.url) {
        text += `링크: ${post.url}\n`;
      }
      text += `\n`;
    });
  }

  text += `\n이 이메일은 자동으로 발송되었습니다.\n`;

  return text;
}

