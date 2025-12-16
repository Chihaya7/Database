import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime

# 配置
SOURCE_URL = "https://wn01.link/"
SCRIPT_FILE = "wnacg"

def fetch_latest_urls():
    """从发布页获取所有最新网址"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(SOURCE_URL, headers=headers, timeout=15)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        urls = []
        
        # 方法1: 查找包含"最新地址"或"最新网址"的文本
        text_content = soup.get_text()
        
        # 使用正则提取所有网址模式
        # 匹配 www.wnXX.xx 或 www.wnacgXX.xx 格式
        pattern = r'www\.wn(?:acg)?\d+\.\w+'
        found_urls = re.findall(pattern, text_content)
        
        if found_urls:
            urls = list(set(found_urls))  # 去重
            print(f"找到 {len(urls)} 个网址:")
            for url in urls:
                print(f"  - {url}")
            return urls
        
        # 方法2: 如果正则没找到，尝试查找所有链接
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            # 提取域名
            match = re.search(r'www\.wn(?:acg)?\d+\.\w+', href)
            if match:
                urls.append(match.group(0))
        
        if urls:
            urls = list(set(urls))  # 去重
            print(f"找到 {len(urls)} 个网址:")
            for url in urls:
                print(f"  - {url}")
            return urls
        
        print("未能找到有效网址")
        return []
        
    except Exception as e:
        print(f"获取网址失败: {e}")
        return []

def update_userscript(new_urls):
    """在现有 @match 基础上新增网址"""
    if not new_urls:
        print("没有新网址，跳过更新")
        return False
    
    try:
        # 读取脚本文件
        with open(SCRIPT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取现有的所有 @match 规则中的网址
        existing_matches = re.findall(r'//\s*@match\s+(https?://[^\s]+)', content)
        existing_urls = set()
        
        for match in existing_matches:
            # 提取域名部分
            domain_match = re.search(r'https?://([^/]+)', match)
            if domain_match:
                existing_urls.add(domain_match.group(1))
        
        print(f"现有 @match 规则: {len(existing_urls)} 个")
        for url in sorted(existing_urls):
            print(f"  - {url}")
        
        # 找出需要新增的网址
        new_domains = set(new_urls) - existing_urls
        
        if not new_domains:
            print("所有网址已存在，无需更新")
            return False
        
        print(f"\n需要新增: {len(new_domains)} 个")
        for url in sorted(new_domains):
            print(f"  + {url}")
        
        # 找到最后一个 @match 的位置
        last_match = None
        for match in re.finditer(r'//\s*@match\s+[^\n]+', content):
            last_match = match
        
        if not last_match:
            print("未找到 @match 规则")
            return False
        
        # 在最后一个 @match 后面插入新的规则
        insert_pos = last_match.end()
        
        # 生成新的 @match 行
        new_lines = []
        for url in sorted(new_domains):
            new_lines.append(f"\n// @match        https://{url}/*")
        
        new_content = content[:insert_pos] + ''.join(new_lines) + content[insert_pos:]
        
        # 写入文件
        with open(SCRIPT_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"\n✅ 成功新增 {len(new_domains)} 个 @match 规则")
        return True
            
    except Exception as e:
        print(f"更新脚本失败: {e}")
        return False

if __name__ == "__main__":
    print(f"开始更新 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"源地址: {SOURCE_URL}")
    print("-" * 50)
    
    # 获取所有最新网址
    latest_urls = fetch_latest_urls()
    
    # 更新脚本
    if latest_urls:
        updated = update_userscript(latest_urls)
        print("-" * 50)
        if updated:
            print("✅ 更新成功")
        else:
            print("ℹ️ 无需更新")
    else:
        print("-" * 50)
        print("❌ 获取网址失败")
