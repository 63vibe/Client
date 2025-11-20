import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, TrendingUp, Clock } from 'lucide-react';

interface DomainNewsItem {
  id: string;
  domain: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  url: string;
}

const mockDomainNews: DomainNewsItem[] = [
  {
    id: 'd1',
    domain: 'AI',
    title: 'OpenAI, GPT-5 개발 로드맵 공개',
    summary: '차세대 AI 모델의 성능 개선과 새로운 기능들이 2025년 상반기 출시 예정으로 발표되었습니다.',
    source: 'TechCrunch',
    date: '2024-11-18',
    url: 'https://techcrunch.com'
  },
  {
    id: 'd2',
    domain: 'AI',
    title: '국내 AI 스타트업, 글로벌 투자 유치',
    summary: '한국의 AI 기술 스타트업이 실리콘밸리 VC로부터 500억 원 규모의 투자를 유치했습니다.',
    source: '매일경제',
    date: '2024-11-18',
    url: 'https://mk.co.kr'
  },
  {
    id: 'd3',
    domain: '금융',
    title: '디지털 금융 혁신, 오픈뱅킹 2.0 도입',
    summary: '금융위원회가 오픈뱅킹 2.0 정책을 발표하며 핀테크 생태계 확대에 나섰습니다.',
    source: '한국경제',
    date: '2024-11-17',
    url: 'https://hankyung.com'
  },
  {
    id: 'd4',
    domain: '금융',
    title: '암호화폐 규제 완화, 기관 투자 급증',
    summary: '새로운 가상자산 가이드라인 발표 이후 기관 투자자들의 암호화폐 시장 진입이 활발해지고 있습니다.',
    source: '조선비즈',
    date: '2024-11-17',
    url: 'https://biz.chosun.com'
  },
  {
    id: 'd5',
    domain: '방산',
    title: '한국형 전투기 수출 계약 체결',
    summary: 'KF-21 보라매 전투기의 첫 해외 수출 계약이 체결되어 방산 수출 역사에 새로운 이정표를 세웠습니다.',
    source: '연합뉴스',
    date: '2024-11-16',
    url: 'https://yonhapnews.co.kr'
  },
  {
    id: 'd6',
    domain: '에너지',
    title: '재생에너지 비중 30% 돌파 전망',
    summary: '2024년 국내 전력 생산에서 재생에너지 비중이 처음으로 30%를 돌파할 것으로 예상됩니다.',
    source: '에너지경제',
    date: '2024-11-16',
    url: 'https://ekn.kr'
  },
  {
    id: 'd7',
    domain: '제조',
    title: '스마트 팩토리 도입률 50% 달성',
    summary: '중소 제조업체의 스마트 팩토리 도입률이 50%를 넘어서며 제조업 디지털 전환이 가속화되고 있습니다.',
    source: '산업일보',
    date: '2024-11-15',
    url: 'https://ksan.kr'
  },
  {
    id: 'd8',
    domain: '레저',
    title: 'K-팝 콘서트 투어, 글로벌 매출 신기록',
    summary: '2024년 K-팝 아티스트들의 월드 투어 매출이 역대 최고치를 경신하며 한류 열풍을 증명했습니다.',
    source: 'Billboard Korea',
    date: '2024-11-15',
    url: 'https://billboard.com'
  }
];

const DOMAIN_COLORS: Record<string, string> = {
  'AI': 'bg-purple-100 text-purple-700 border-purple-200',
  '금융': 'bg-blue-100 text-blue-700 border-blue-200',
  '방산': 'bg-red-100 text-red-700 border-red-200',
  '에너지': 'bg-green-100 text-green-700 border-green-200',
  '제조': 'bg-orange-100 text-orange-700 border-orange-200',
  '레저': 'bg-pink-100 text-pink-700 border-pink-200'
};

interface DomainNewsProps {
  selectedDomains?: string[];
}

export function DomainNews({ selectedDomains = ['ai', 'finance'] }: DomainNewsProps) {
  // 선택된 도메인 매핑
  const domainMap: Record<string, string> = {
    'ai': 'AI',
    'finance': '금융',
    'defense': '방산',
    'energy': '에너지',
    'manufacturing': '제조',
    'leisure': '레저'
  };

  const activeDomainNames = selectedDomains.map(id => domainMap[id]);
  const filteredNews = mockDomainNews.filter(news => 
    activeDomainNames.includes(news.domain)
  );

  if (filteredNews.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date('2024-11-18');
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return dateStr;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-gray-900">사업 도메인 최신 동향</h3>
          <p className="text-sm text-gray-600">외부 온라인 뉴스 크롤링 기반</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">선택된 도메인:</span>
        {activeDomainNames.map(domain => (
          <Badge 
            key={domain} 
            variant="outline" 
            className={DOMAIN_COLORS[domain]}
          >
            {domain}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map(news => (
          <Card key={news.id} className="p-5 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start justify-between mb-3">
              <Badge 
                variant="outline" 
                className={DOMAIN_COLORS[news.domain]}
              >
                {news.domain}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(news.date)}
              </span>
            </div>

            <h4 className="text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer">
              {news.title}
            </h4>

            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {news.summary}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{news.source}</span>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
