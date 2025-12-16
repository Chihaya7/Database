import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime

# 配置
SOURCE_URL = "https://wn01.link/"
SCRIPT_FILE = "wnacg"

def fetch_latest_url():
    """从发布页获取最新网址"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(SOURCE_URL, headers=headers, timeout=15)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 方法1: 查找包含"最新网址"文本的元素
        for element in soup.find_all(['a', 'span', 'div', 'p']):
            text = element.get_text()
            if '最新网址' in text or '最新地址' in text:
                # 尝试从该元素或其父元素中找到链接
                link = element.find('a') if element.name != 'a' else element
                if not link:
                    link = element.find_next('a')
                if not link:
                    parent = element.parent
                    if parent:
                        link = parent.find('a')
                
                if link and link.get('href'):
                    url = link.get('href')
                    # 确保是完整的URL
                    if url.startswith('http'):
                        print(f"找到网址: {url}")
                        return url
        
        # 方法2: 查找所有链接，取第一个看起来像主站的链接
        for link in soup.find_all('a', href=True):
            url = link.get('href')
            if url.startswith('http') and 'wn' in url.lower():
                print(f"找到网址: {url}")
                return url
        
        print("未能找到有效网址")
        return None
        
    except Exception as e:
        print(f"获取网址失败: {e}")
        return None

def update_userscript(new_url):
    """更新油猴脚本中的 @match 规则"""
    if not new_url:
        print("没有新网址，跳过更新")
        return False
    
    try:
        # 读取脚本文件
        with open(SCRIPT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取域名用于 @match
        # 例如: https://www.example.com/path -> https://www.example.com/*
        match = re.search(r'(https?://[^/]+)', new_url)
        if not match:
            print("无法解析网址")
            return False
        
        base_url = match.group(1)
        match_pattern = f"{base_url}/*"
        
        # 查找并替换 @match 行
        # 匹配类似: // @match        https://xxx/*
        pattern = r'(//\s*@match\s+)https?://[^\s]+'
        
        if re.search(pattern, content):
            new_content = re.sub(pattern, f'\\1{match_pattern}', content)
            
            # 检查是否有实际更改
            if new_content == content:
                print("网址未变化，无需更新")
                return False
            
            # 写入文件
            with open(SCRIPT_FILE, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"成功更新 @match 为: {match_pattern}")
            return True
        else:
            print("未找到 @match 规则")
            return False
            
    except Exception as e:
        print(f"更新脚本失败: {e}")
        return False

if __name__ == "__main__":
    print(f"开始更新 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 获取最新网址
    latest_url = fetch_latest_url()
    
    # 更新脚本
    if latest_url:
        updated = update_userscript(latest_url)
        if updated:
            print("✅ 更新成功")
        else:
            print("ℹ️ 无需更新")
    else:
        print("❌ 获取网址失败")
