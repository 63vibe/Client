/**
 * 이메일 발송을 위한 데이터 조회 서비스
 */

import { supabase } from '../supabase';
import { UserEmail, Post, UserPosts } from './types';
import { getKeywordsByEmployeeId } from '../keywords';

/**
 * 활성 유저의 이메일 목록 조회
 */
export async function getActiveUserEmails(): Promise<UserEmail[]> {
  try {
    // is_active 컬럼이 있는지 확인하고, 없으면 모든 유저 조회
    let query = supabase
      .from('users')
      .select('employee_id, email, name');

    // is_active 컬럼이 있을 수 있으므로 조건부로 추가
    // 실제 스키마에 맞게 수정 필요
    try {
      const { data, error } = await query
        .eq('is_active', true)
        .not('email', 'is', null);

      if (error && error.code === 'PGRST116') {
        // 컬럼이 없는 경우 모든 유저 조회
        console.warn('is_active 컬럼이 없어 모든 유저를 조회합니다.');
        const { data: allData, error: allError } = await supabase
          .from('users')
          .select('employee_id, email, name')
          .not('email', 'is', null);

        if (allError) {
          console.error('활성 유저 조회 오류:', allError);
          throw allError;
        }

        if (!allData) {
          return [];
        }

        return allData
          .filter((user: any) => user.email) // email이 있는 유저만
          .map((user: any) => ({
            employee_id: user.employee_id,
            email: user.email,
            name: user.name || '사용자',
          }));
      }

      if (error) {
        console.error('활성 유저 조회 오류:', error);
        throw error;
      }

      if (!data) {
        return [];
      }

      return data
        .filter((user: any) => user.email) // email이 있는 유저만
        .map((user: any) => ({
          employee_id: user.employee_id,
          email: user.email,
          name: user.name || '사용자',
        }));
    } catch (queryError: any) {
      // is_active 컬럼이 없는 경우 처리
      if (queryError.code === '42703' || queryError.message?.includes('is_active')) {
        console.warn('is_active 컬럼이 없어 모든 유저를 조회합니다.');
        const { data: allData, error: allError } = await supabase
          .from('users')
          .select('employee_id, email, name')
          .not('email', 'is', null);

        if (allError) {
          console.error('활성 유저 조회 오류:', allError);
          throw allError;
        }

        if (!allData) {
          return [];
        }

        return allData
          .filter((user: any) => user.email) // email이 있는 유저만
          .map((user: any) => ({
            employee_id: user.employee_id,
            email: user.email,
            name: user.name || '사용자',
          }));
      }
      throw queryError;
    }
  } catch (error) {
    console.error('활성 유저 이메일 조회 실패:', error);
    throw error;
  }
}

/**
 * 특정 유저의 키워드 목록 조회
 */
async function getUserKeywords(employeeId: string): Promise<string[]> {
  try {
    const keywords = await getKeywordsByEmployeeId(employeeId);
    return keywords.map((k) => k.text);
  } catch (error) {
    console.error(`유저 ${employeeId}의 키워드 조회 실패:`, error);
    return [];
  }
}

/**
 * 하루치 게시물 데이터 조회 (어제 00:00 ~ 오늘 00:00)
 */
async function getDailyPosts(): Promise<Post[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // 게시물 테이블이 있다고 가정 (실제 테이블명에 맞게 수정 필요)
    // 현재는 mock 데이터 구조를 참고하여 작성
    const { data, error } = await supabase
      .from('posts') // 실제 테이블명으로 변경 필요
      .select('*')
      .gte('created_at', yesterdayStr)
      .lt('created_at', todayStr)
      .order('created_at', { ascending: false });

    if (error) {
      // 테이블이 없을 경우를 대비해 에러를 로그만 남기고 빈 배열 반환
      console.warn('게시물 조회 오류 (테이블이 없을 수 있음):', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // DB 데이터를 Post 타입으로 변환
    return data.map((post: any) => ({
      id: post.id || post.post_id,
      board: post.board || post.board_name || '기타',
      title: post.title || post.subject || '',
      summary: post.summary || post.content?.substring(0, 200) || '',
      keywords: post.keywords || [],
      author: post.author || post.author_name || '알 수 없음',
      date: post.created_at?.split('T')[0] || post.date || '',
      views: post.views || post.view_count || 0,
      isNew: true, // 하루치 데이터이므로 모두 새 게시물
      matchedKeywords: [],
      source: post.source || 'board',
      url: post.url || post.link || '',
    }));
  } catch (error) {
    console.error('하루치 게시물 조회 실패:', error);
    return [];
  }
}

/**
 * 유저별로 매칭되는 게시물 필터링
 */
function filterPostsByKeywords(posts: Post[], userKeywords: string[]): Post[] {
  if (userKeywords.length === 0) {
    return posts;
  }

  return posts.map((post) => {
    const matchedKeywords = userKeywords.filter((keyword) => {
      const lowerKeyword = keyword.toLowerCase();
      return (
        post.title.toLowerCase().includes(lowerKeyword) ||
        post.summary.toLowerCase().includes(lowerKeyword) ||
        post.keywords.some((k) => k.toLowerCase().includes(lowerKeyword))
      );
    });

    return {
      ...post,
      matchedKeywords,
    };
  }).filter((post) => post.matchedKeywords.length > 0);
}

/**
 * 각 유저의 하루치 게시물 데이터 조회 및 정리
 */
export async function getUserPostsData(): Promise<UserPosts[]> {
  try {
    // 1. 활성 유저 목록 조회
    const activeUsers = await getActiveUserEmails();
    console.log(`활성 유저 수: ${activeUsers.length}`);

    // 2. 하루치 게시물 조회
    const dailyPosts = await getDailyPosts();
    console.log(`하루치 게시물 수: ${dailyPosts.length}`);

    // 3. 각 유저별로 키워드 매칭하여 게시물 필터링
    const userPostsList: UserPosts[] = [];

    for (const user of activeUsers) {
      try {
        const userKeywords = await getUserKeywords(user.employee_id);
        const matchedPosts = filterPostsByKeywords(dailyPosts, userKeywords);

        // 키워드가 없거나 매칭된 게시물이 없는 경우에도 빈 배열로 추가
        // (유저가 모든 게시물을 받기 원할 수 있음)
        userPostsList.push({
          user,
          posts: matchedPosts,
        });
      } catch (error) {
        console.error(`유저 ${user.employee_id}의 게시물 처리 실패:`, error);
        // 에러가 발생해도 빈 배열로 추가하여 다른 유저에게는 발송 계속
        userPostsList.push({
          user,
          posts: [],
        });
      }
    }

    return userPostsList;
  } catch (error) {
    console.error('유저별 게시물 데이터 조회 실패:', error);
    throw error;
  }
}

