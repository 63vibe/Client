'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash2, Link2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { getUserDomainsByEmployeeId, replaceUserDomains } from '@/src/lib/user_domains';
import { getUserFromStorage } from '@/src/lib/auth';

interface Board {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastCrawled: string;
  postCount: number;
  status: 'active' | 'error' | 'pending';
}

const mockBoards: Board[] = [
  {
    id: '1',
    name: '공지사항',
    url: 'https://intranet.company.com/notice',
    isActive: true,
    lastCrawled: '2024-11-18 08:00',
    postCount: 42,
    status: 'active'
  },
  {
    id: '2',
    name: '개발팀',
    url: 'https://intranet.company.com/dev',
    isActive: true,
    lastCrawled: '2024-11-18 08:00',
    postCount: 156,
    status: 'active'
  },
  {
    id: '3',
    name: '프로젝트',
    url: 'https://intranet.company.com/projects',
    isActive: true,
    lastCrawled: '2024-11-18 08:00',
    postCount: 89,
    status: 'active'
  },
  {
    id: '4',
    name: '복지',
    url: 'https://intranet.company.com/welfare',
    isActive: true,
    lastCrawled: '2024-11-18 08:00',
    postCount: 28,
    status: 'active'
  },
  {
    id: '5',
    name: '기술블로그',
    url: 'https://intranet.company.com/tech-blog',
    isActive: false,
    lastCrawled: '2024-11-17 20:00',
    postCount: 234,
    status: 'pending'
  },
  {
    id: '6',
    name: '마케팅팀',
    url: 'https://intranet.company.com/marketing',
    isActive: true,
    lastCrawled: '2024-11-18 08:00',
    postCount: 67,
    status: 'active'
  }
];

const BUSINESS_DOMAINS = [
  { id: 'manufacturing', name: '제조' },
  { id: 'finance', name: '금융' },
  { id: 'defense', name: '방산' },
  { id: 'energy', name: '에너지' },
  { id: 'ai', name: 'AI' },
  { id: 'leisure', name: '레저' }
];

interface BoardManagerProps {
  isAdmin: boolean;
}

export function BoardManager({ isAdmin }: BoardManagerProps) {
  const [boards, setBoards] = useState<Board[]>(mockBoards);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardUrl, setNewBoardUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<string[]>(mockBoards.filter(b => b.isActive).map(b => b.id));
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 도메인 ID와 실제 도메인명 매핑
  const domainIdToName: Record<string, string> = {
    'ai': 'AI',
    'finance': '금융',
    'defense': '방산',
    'energy': '에너지',
    'manufacturing': '제조',
    'leisure': '레저'
  };

  const domainNameToId: Record<string, string> = {
    'AI': 'ai',
    '금융': 'finance',
    '방산': 'defense',
    '에너지': 'energy',
    '제조': 'manufacturing',
    '레저': 'leisure'
  };

  // 사용자의 선택한 도메인 로드
  useEffect(() => {
    const loadUserDomains = async () => {
      try {
        setLoading(true);
        const user = getUserFromStorage();
        if (!user) {
          setSelectedDomains([]);
          return;
        }

        const userDomains = await getUserDomainsByEmployeeId(user.employee_id);
        // 도메인명을 ID로 변환
        const domainIds = userDomains
          .map(ud => domainNameToId[ud.domain])
          .filter(id => id !== undefined) as string[];
        
        setSelectedDomains(domainIds);
      } catch (error) {
        console.error('도메인 로드 오류:', error);
        setSelectedDomains([]);
      } finally {
        setLoading(false);
      }
    };

    if (!isAdmin) {
      loadUserDomains();
    }
  }, [isAdmin]);

  const handleToggleBoard = (id: string) => {
    setBoards(boards.map(board => 
      board.id === id ? { ...board, isActive: !board.isActive } : board
    ));
  };

  const handleDeleteBoard = (id: string) => {
    setBoards(boards.filter(board => board.id !== id));
  };

  const handleAddBoard = () => {
    if (newBoardName) {
      const newBoard: Board = {
        id: Date.now().toString(),
        name: newBoardName,
        url: newBoardUrl,
        isActive: true,
        lastCrawled: '-',
        postCount: 0,
        status: 'pending'
      };
      setBoards([...boards, newBoard]);
      setNewBoardName('');
      setNewBoardUrl('');
      setIsDialogOpen(false);
    }
  };

  const handleCrawlNow = (id: string) => {
    console.log('Crawling board:', id);
    setBoards(boards.map(board => 
      board.id === id ? { ...board, lastCrawled: new Date().toLocaleString('ko-KR'), status: 'active' } : board
    ));
  };

  const toggleBoardSelection = (id: string) => {
    if (selectedBoards.includes(id)) {
      setSelectedBoards(selectedBoards.filter(boardId => boardId !== id));
    } else {
      setSelectedBoards([...selectedBoards, id]);
    }
  };

  const toggleDomainSelection = (id: string) => {
    if (selectedDomains.includes(id)) {
      setSelectedDomains(selectedDomains.filter(domainId => domainId !== id));
    } else {
      setSelectedDomains([...selectedDomains, id]);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const user = getUserFromStorage();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 선택된 도메인 ID를 도메인명으로 변환
      const domainNames = selectedDomains
        .map(id => domainIdToName[id])
        .filter(name => name !== undefined) as string[];

      // 사용자의 도메인 설정 저장
      await replaceUserDomains(user.employee_id, domainNames);
      
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 관리자 UI
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900 mb-2">게시판 관리</h2>
              <p className="text-gray-600">
                크롤링할 게시판을 등록하고 관리합니다
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  게시판 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 게시판 추가</DialogTitle>
                  <DialogDescription>
                    크롤링할 게시판 정보를 입력하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="board-name">게시판 이름</Label>
                    <Input
                      id="board-name"
                      placeholder="예: HR팀 게시판"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="board-url">게시판 URL</Label>
                    <Input
                      id="board-url"
                      placeholder="https://intranet.company.com/hr"
                      value={newBoardUrl}
                      onChange={(e) => setNewBoardUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddBoard}>
                    추가
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-sm text-blue-700 mb-1">활성 게시판</div>
              <div className="text-blue-900">{boards.filter(b => b.isActive).length}개</div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-sm text-green-700 mb-1">총 게시글</div>
              <div className="text-green-900">{boards.reduce((sum, b) => sum + b.postCount, 0)}개</div>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="text-sm text-purple-700 mb-1">마지막 크롤링</div>
              <div className="text-purple-900">오늘 08:00</div>
            </Card>
          </div>
        </Card>

        <div className="space-y-3">
          {boards.map(board => {
            const hasNoUrl = !board.url || board.url.trim() === '';
            
            return (
              <Card key={board.id} className={`p-6 ${hasNoUrl ? 'border-red-300 bg-red-50/30' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-gray-900">{board.name}</h3>
                      {hasNoUrl && (
                        <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          URL 미설정
                        </Badge>
                      )}
                      <Badge variant={board.status === 'active' ? 'default' : board.status === 'error' ? 'destructive' : 'secondary'}>
                        {board.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {board.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                        {board.status === 'active' ? '정상' : board.status === 'error' ? '오류' : '대기중'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Link2 className="w-4 h-4" />
                      {hasNoUrl ? (
                        <span className="text-red-600 italic">URL이 설정되지 않았습니다</span>
                      ) : (
                        <span className="truncate">{board.url}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div>
                        <span className="text-gray-600">게시글:</span> {board.postCount}개
                      </div>
                      <div>
                        <span className="text-gray-600">마지막 크롤링:</span> {board.lastCrawled}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 items-end">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`board-${board.id}`} className="text-sm">
                        {board.isActive ? '활성' : '비활성'}
                      </Label>
                      <Switch
                        id={`board-${board.id}`}
                        checked={board.isActive}
                        onCheckedChange={() => handleToggleBoard(board.id)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCrawlNow(board.id)}
                        disabled={hasNoUrl}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        지금 크롤링
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBoard(board.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // 일반 유저 UI
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-gray-900 mb-2">내 구독 게시판 설정</h2>
          <p className="text-gray-600">
            받고 싶은 게시판을 선택하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-700 mb-1">선택한 게시판</div>
            <div className="text-blue-900">{selectedBoards.length}개</div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-sm text-green-700 mb-1">선택한 도메인</div>
            <div className="text-green-900">{selectedDomains.length}개</div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-sm text-purple-700 mb-1">총 뉴스 소스</div>
            <div className="text-purple-900">{selectedBoards.length + selectedDomains.length}개</div>
          </Card>
        </div>
      </Card>

      {/* 게시판 선택 */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">사내 게시판 선택</h3>
        <div className="space-y-3">
          {boards.map(board => (
            <div
              key={board.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`user-board-${board.id}`}
                  checked={selectedBoards.includes(board.id)}
                  onCheckedChange={() => toggleBoardSelection(board.id)}
                />
                <Label htmlFor={`user-board-${board.id}`} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{board.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {board.postCount}개 게시글
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{board.url || 'URL 미설정'}</p>
                </Label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 도메인 뉴스 선택 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gray-600" />
          <h3 className="text-gray-900">사업 도메인 주요 뉴스 포함 여부</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          외부 온라인 뉴스에서 선택한 도메인의 최신 동향을 함께 받아볼 수 있습니다
        </p>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            도메인 정보를 불러오는 중...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BUSINESS_DOMAINS.map(domain => (
              <div
                key={domain.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <Checkbox
                  id={`domain-${domain.id}`}
                  checked={selectedDomains.includes(domain.id)}
                  onCheckedChange={() => toggleDomainSelection(domain.id)}
                />
                <Label htmlFor={`domain-${domain.id}`} className="cursor-pointer">
                  <span className="text-gray-900">{domain.name}</span>
                </Label>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving || loading}>
          {saving ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  );
}
