#!/usr/bin/env python3
"""
Updates all 7 locales (pt, en, fr, de, ja, ko, zh) in locales/*.json
with the 75 concrete space objects and synchronized bossWords.
"""

import json
import os
import re

CONCEPTS = [
    {
        "asset": "sun",
        "type": "cosmos",
        "pt": ("sol", "Estrela central do nosso sistema solar que provê luz, calor e energia gravitacional"),
        "en": ("sun", "Central star of our solar system providing light, heat and gravitational pull"),
        "fr": ("soleil", "Étoile centrale de notre système solaire fournissant lumière, chaleur et gravité"),
        "de": ("sonne", "Zentralstern unseres Sonnensystems, der Licht, Wärme und Gravitation spendet"),
        "ja": ("たいよう", "光と熱と重力エネルギーを供給する太陽系の中心星"),
        "ko": ("태양", "빛과 열, 중력 에너지를 공급하는 우리 태양계의 중심 항성"),
        "zh": ("太阳", "太阳系中心的恒星，提供光、热和强大的引力支持")
    },
    {
        "asset": "moon",
        "type": "cosmos",
        "pt": ("lua", "Satélite natural que orbita a Terra e influencia as marés oceânicas"),
        "en": ("moon", "Natural satellite orbiting the Earth influencing oceanic tidal forces"),
        "fr": ("lune", "Satellite naturel en orbite autour de la Terre influençant les marées"),
        "de": ("mond", "Natürlicher Satellit, der die Erde umkreist und Gezeitenkräfte erzeugt"),
        "ja": ("つき", "地球を周回し潮汐現象に強い影響を与える天然の衛星"),
        "ko": ("달", "지구를 공전하며 해양 조석 현상에 큰 영향을 미치는 자연 위성"),
        "zh": ("月球", "环绕地球运行并影响海洋潮汐涨落的天然卫星")
    },
    {
        "asset": "rock",
        "type": "hazard",
        "pt": ("rocha", "Fragmento rochoso espacial errante que viaja através do cosmos em direção à Terra"),
        "en": ("rock", "Wandering space rock fragment travelling through the cosmos towards Earth"),
        "fr": ("roche", "Fragment rocheux spatial errant voyageant à travers le cosmos vers la Terre"),
        "de": ("felsen", "Wanderndes Weltraumgestein, das durch den Kosmos Richtung Erde reist"),
        "ja": ("いわ", "宇宙空間を漂流し地球方向へ飛来する巨大な宇宙岩石"),
        "ko": ("암석", "우주 공간을 떠돌며 지구 방향으로 돌진하는 거대한 우주 암석"),
        "zh": ("岩石", "在宇宙深空中漫游并朝地球方向坠落的坚硬空间岩石")
    },
    {
        "asset": "mercury",
        "type": "cosmos",
        "pt": ("mercurio", "O menor planeta do sistema solar e o mais próximo do calor abrasador do Sol"),
        "en": ("mercury", "The smallest planet in the solar system and closest to the searing Sun"),
        "fr": ("mercure", "La plus petite planète du système solaire et la plus proche du Soleil"),
        "de": ("merkur", "Der kleinste Planet des Sonnensystems und der sonnennächste Himmelskörper"),
        "ja": ("すいせい", "太陽に最も近く猛烈な熱と寒冷に晒される太陽系最小の惑星"),
        "ko": ("수성", "태양에 가장 가까이 위치하며 태양계에서 가장 작은 암석형 행성"),
        "zh": ("水星", "距离太阳最近且体积最小的炙热岩石行星")
    },
    {
        "asset": "venus",
        "type": "cosmos",
        "pt": ("venus", "O segundo planeta a partir do Sol com atmosfera densa e efeito estufa extremo"),
        "en": ("venus", "The second planet from the Sun with dense atmosphere and runaway greenhouse heat"),
        "fr": ("venus", "Deuxième planète du système solaire à l'effet de serre extrême et étouffant"),
        "de": ("venus", "Der zweite Planet von der Sonne mit dichter Atmosphäre und extremem Treibhauseffekt"),
        "ja": ("きんせい", "厚い硫酸の大気と猛烈な温室効果を持つ夜空で最も明るい惑星"),
        "ko": ("금성", "두꺼운 대기와 극심한 온실효과로 뒤덮인 밤하늘의 가장 밝은 행성"),
        "zh": ("金星", "拥有浓厚大气层和极度温室效应的明亮行星")
    },
    {
        "asset": "vesta",
        "type": "hazard",
        "pt": ("vesta", "O segundo asteroide mais massivo do cinturão com uma colossal cratera de impacto polar"),
        "en": ("vesta", "The second most massive asteroid in the belt featuring a colossal south polar impact crater"),
        "fr": ("vesta", "Le deuxième plus gros astéroïde de la ceinture arborant un cratère d'impact titanesque"),
        "de": ("vesta", "Der zweitmassereichste Asteroid im Gürtel mit einem gigantischen Einschlagkrater"),
        "ja": ("ベスタ", "小惑星帯で2番目に巨大な質量を持ち巨大クレーターが刻まれた小惑星"),
        "ko": ("베스타", "소행성대에서 두 번째로 거대하며 거대한 충돌구를 지닌 소행성"),
        "zh": ("灶神星", "小行星带中质量第二大且南极拥有巨大撞击坑的著名原行星")
    },
    {
        "asset": "mars",
        "type": "cosmos",
        "pt": ("marte", "O planeta vermelho coberto por óxido de ferro e lar do colossal Monte Olimpo"),
        "en": ("mars", "The red planet coated in iron oxide dust and home to giant Olympus Mons"),
        "fr": ("mars", "La planète rouge couverte d'oxyde de fer et abritant le mont Olympe"),
        "de": ("mars", "Der rote Planet mit Eisenoxidsand und dem gewaltigen Vulkan Olympus Mons"),
        "ja": ("かせい", "酸化鉄の赤い砂塵に覆われ太陽系最大の火山オリンポス山を擁する惑星"),
        "ko": ("화성", "붉은 산화철 먼지로 뒤덮여 있으며 태양계 최대 화산을 보유한 행성"),
        "zh": ("火星", "表面覆盖氧化铁红沙并拥有太阳系最高火山的红色行星")
    },
    {
        "asset": "jupiter",
        "type": "cosmos",
        "pt": ("jupiter", "O maior gigante gasoso do sistema solar exibindo a icônica Grande Mancha Vermelha"),
        "en": ("jupiter", "The colossal gas giant of our system featuring the iconic Great Red Spot"),
        "fr": ("jupiter", "Le géant gazeux colossal réputé pour sa Grande Tache Rouge tourbillonnante"),
        "de": ("jupiter", "Der gigantische Gasplanet mit dem berühmten Wirbelsturm des Großen Roten Flecks"),
        "ja": ("もくせい", "巨大な大赤斑の嵐が渦巻く太陽系最大の圧倒的なガス巨大惑星"),
        "ko": ("목성", "거대한 대적점 폭풍이 소용돌이치는 태양계 최대의 가스 행성"),
        "zh": ("木星", "拥有著名大红斑风暴的太阳系最大气态巨行星")
    },
    {
        "asset": "saturn",
        "type": "cosmos",
        "pt": ("saturno", "O impressionante gigante gasoso famoso por seus majestosos anéis de gelo e poeira"),
        "en": ("saturn", "The striking gas giant adorned with majestic rings of pure ice and cosmic dust"),
        "fr": ("saturne", "Le magnifique géant gazeux ceint de spectaculaires anneaux de glace scintillants"),
        "de": ("saturn", "Der prächtige Gasriese, berühmt für sein weithin leuchtendes Ringsystem aus Eis"),
        "ja": ("どせい", "氷と塵粒子で構成された美しい環をまとう壮麗なガス巨大惑星"),
        "ko": ("토성", "순수한 얼음과 먼지로 이루어진 찬란한 고리를 지닌 신비로운 가스 행성"),
        "zh": ("土星", "拥有绚丽而宽广冰尘光环系统的壮美气态巨行星")
    },
    {
        "asset": "uranus",
        "type": "cosmos",
        "pt": ("urano", "Gigante de gelo azul-esverdeado que gira de lado com atmosfera de metano gelado"),
        "en": ("uranus", "A cyan ice giant rotating on its side wrapped in chilling methane clouds"),
        "fr": ("uranus", "Géante de glace aux teintes cyan tournant sur son flanc dans un froid extrême"),
        "de": ("uranus", "Ein türkisblauer Eisriese, der seitlich rollend um die ferne Sonne kreist"),
        "ja": ("てんのうせい", "極端に傾いた自転軸を持ちメタン氷の青緑色に輝く氷巨大惑星"),
        "ko": ("천왕성", "자전축이 옆으로 기울어진 채 메탄 구름으로 푸르게 빛나는 거대 얼음 행성"),
        "zh": ("天王星", "自转轴极度倾斜并散发青蓝色光辉的冰巨星")
    },
    {
        "asset": "neptune",
        "type": "cosmos",
        "pt": ("netuno", "O planeta mais distante do Sol varrido pelos ventos supersônicos mais velozes"),
        "en": ("neptune", "The farthest planet from the Sun swept by the fiercest supersonic storms"),
        "fr": ("neptune", "La planète la plus lointaine balayée par des vents supersoniques furieux"),
        "de": ("neptun", "Der äußerste Planet unseres Systems mit den schnellsten Stürmen im Sonnensystem"),
        "ja": ("かいおうせい", "太陽系最遠の深青色の世界で音速を超える超高速嵐が吹き荒れる惑星"),
        "ko": ("해왕성", "태양에서 가장 멀리 떨어져 음속을 초과하는 맹렬한 폭풍이 부는 푸른 행성"),
        "zh": ("海王星", "太阳系最外层且伴随超音速狂暴飓风的深蓝色冰巨星")
    },
    {
        "asset": "pluto",
        "type": "cosmos",
        "pt": ("plutao", "Planeta anão gelado do Cinturão de Kuiper adornado por uma vasta planície em forma de coração"),
        "en": ("pluto", "Dwarf planet in the Kuiper Belt featuring a vast nitrogen ice heart plain"),
        "fr": ("pluton", "Planète naine glacée de la ceinture de Kuiper arborant un cœur d'azote"),
        "de": ("pluto", "Vereister Zwergplanet im Kuipergürtel mit einer berühmten herzförmigen Hochebene"),
        "ja": ("めいおうせい", "カイパーベルトに位置し窒素氷のハート型平原が広がる準惑星"),
        "ko": ("명왕성", "카이퍼 벨트의 얼어붙은 세계로 질소 얼음의 하트 평원을 지닌 왜소행성"),
        "zh": ("冥王星", "位于柯伊伯带且拥有著名心形氮冰平原的冰封矮行星")
    },
    {
        "asset": "ceres",
        "type": "cosmos",
        "pt": ("ceres", "O maior objeto do cinturão de asteroides entre Marte e Júpiter classificado como planeta anão"),
        "en": ("ceres", "The largest asteroid belt object between Mars and Jupiter classified as dwarf planet"),
        "fr": ("ceres", "Le plus grand objet de la ceinture d'astéroïdes entre Mars et Jupiter"),
        "de": ("ceres", "Das größte Objekt im Asteroidengürtel zwischen Mars und Jupiter, ein Zwergplanet"),
        "ja": ("ケレス", "火星と木星の間の小惑星帯に位置する最大の天体であり球状の準惑星"),
        "ko": ("세레스", "화성과 목성 사이 소행성대에서 가장 거대한 구형의 왜소행성"),
        "zh": ("谷神星", "位于火星与木星之间小行星带中体积最大的球形矮行星")
    },
    {
        "asset": "titan",
        "type": "cosmos",
        "pt": ("tita", "A maior lua de Saturno dotada de atmosfera densa e mares de metano líquido"),
        "en": ("titan", "Saturn's largest moon cloaked in thick atmosphere and seas of liquid methane"),
        "fr": ("titan", "Plus grand satellite de Saturne abritant des lacs et mers de méthane liquide"),
        "de": ("titan", "Saturns größter Mond mit dichter Atmosphäre und Seen aus flüssigem Methan"),
        "ja": ("タイタン", "濃密な大気と液体メタンの湖や海を湛えた土星最大の巨大衛星"),
        "ko": ("타이탄", "두꺼운 질소 대기와 액체 메탄의 바다가 존재하는 토성 최대 위성"),
        "zh": ("土卫六", "拥有浓厚大气层与液态甲烷海洋的土星最大卫星")
    },
    {
        "asset": "phobos",
        "type": "cosmos",
        "pt": ("fobos", "Lua interior e irregular de Marte que orbita velozmente próxima à superfície"),
        "en": ("phobos", "Irregular inner moon of Mars speeding in an orbit dangerously close to the surface"),
        "fr": ("phobos", "Lune intérieure irrégulière de Mars orbitant très près de la planète rouge"),
        "de": ("phobos", "Der unregelmäßige innere Marsmond, der extrem nah über der Oberfläche kreist"),
        "ja": ("フォボス", "火星の地表近くを高速で周回する凹凸に富んだ不規則形状の第1衛星"),
        "ko": ("포보스", "화성 지표면에 매우 가깝게 붙어 고속으로 공전하는 울퉁불퉁한 제1위성"),
        "zh": ("火卫一", "外形不规则且以极近距离快速掠过火星表面的天然卫星")
    },
    {
        "asset": "deimos",
        "type": "cosmos",
        "pt": ("deimos", "A menor e mais externa das duas luas de Marte semelhante a um asteroide escuro"),
        "en": ("deimos", "The smaller and outermost moon of Mars resembling a dark cratered asteroid"),
        "fr": ("deimos", "La plus petite lune extérieure de Mars ressemblant à un astéroïde sombre"),
        "de": ("deimos", "Der kleinere und äußere Marsmond, der einem dunklen Asteroiden ähnelt"),
        "ja": ("ダイモス", "滑らかな塵の層に覆われた火星の外側をゆっくり周回する第2衛星"),
        "ko": ("데이모스", "두꺼운 먼지층으로 덮인 채 화성 외곽을 느리게 공전하는 제2위성"),
        "zh": ("火卫二", "表面覆盖厚厚尘埃且在火星较远轨道缓缓运行的较小卫星")
    },
    {
        "asset": "europa",
        "type": "cosmos",
        "pt": ("europa", "Lua gelada de Júpiter escondendo um colossal oceano líquido sob sua crosta rachada"),
        "en": ("europa", "Jupiter's icy moon concealing a vast liquid ocean beneath its fractured crust"),
        "fr": ("europe", "Lune glacée de Jupiter dissimulant un océan sous sa banquise fracturée"),
        "de": ("europa", "Jupiters Eismond, der unter seinem Eispanzer einen gigantischen Ozean birgt"),
        "ja": ("エウロパ", "ひび割れた氷殻の地下深くに広大な液体の海を隠し持つ木星の氷衛星"),
        "ko": ("유로파", "갈라진 얼음 표면 아래에 거대한 액체 바다를 품고 있는 목성의 위성"),
        "zh": ("木卫二", "在纵横交错的冰原外壳下隐藏着温暖巨大海洋的木星卫星")
    },
    {
        "asset": "io",
        "type": "cosmos",
        "pt": ("io", "O corpo geologicamente mais ativo do sistema solar coberto por centenas de vulcões de enxofre"),
        "en": ("io", "The most volcanically active body in our system covered in erupting sulfur plumes"),
        "fr": ("io", "Le corps le plus volcanique du système solaire criblé de geysers de soufre"),
        "de": ("io", "Der vulkanisch aktivste Himmelskörper unseres Systems mit Schwefelausbrüchen"),
        "ja": ("イオ", "数百もの活火山から硫黄を噴き上げる太陽系で最も火山活動が激しい衛星"),
        "ko": ("이오", "수백 개의 활화산에서 황을 뿜어내는 태양계에서 가장 화산활동이 활발한 위성"),
        "zh": ("木卫一", "表面分布数百座剧烈喷发硫磺火山的太阳系地质活动最活跃卫星")
    },
    {
        "asset": "triton",
        "type": "cosmos",
        "pt": ("tritao", "A colossal lua gelada retrógrada de Netuno expelindo gêiseres de nitrogênio"),
        "en": ("triton", "Neptune's frigid retrograde moon spewing cryovolcanic nitrogen geysers"),
        "fr": ("triton", "Lune glacée rétrograde de Neptune crachant des geysers d'azote liquide"),
        "de": ("triton", "Neptuns riesiger retrograder Eismond mit aktiven Stickstoffgeysiren"),
        "ja": ("トリトン", "逆行軌道を描き液体窒素の氷の火山間欠泉を噴出する海王星最大の衛星"),
        "ko": ("트리톤", "역행 궤도로 공전하며 질소 간헐천을 분출하는 해왕성의 거대 얼음 위성"),
        "zh": ("海卫一", "沿逆行轨道环绕海王星并喷发液氮间歇泉的冰冷巨大卫星")
    },
    {
        "asset": "callisto",
        "type": "cosmos",
        "pt": ("calisto", "Mundo intensamente craterizado de Júpiter preservando a superfície mais antiga"),
        "en": ("callisto", "Jupiter's heavily cratered moon preserving the oldest ancient surface in the system"),
        "fr": ("callisto", "Monde criblé de cratères de Jupiter arborant la surface la plus ancienne"),
        "de": ("kallisto", "Jupiters stark verkraterter Mond mit der ältesten Oberfläche des Sonnensystems"),
        "ja": ("カリスト", "太陽系で最もクレーター密度が高く太古の痕跡をそのまま留める木星の衛星"),
        "ko": ("칼리스토", "수많은 운석 충돌구로 덮여 태양계에서 가장 오래된 표면을 지닌 목성의 위성"),
        "zh": ("木卫四", "布满古老撞击坑且完整保留太阳系原始地貌的木星死寂卫星")
    },
    {
        "asset": "charon",
        "type": "cosmos",
        "pt": ("caronte", "O enorme companheiro binário de Plutão formando um sistema gravitacional duplo travado"),
        "en": ("charon", "Pluto's massive companion moon forming a mutually locked binary dwarf system"),
        "fr": ("charon", "Compagnon colossal de Pluton formant un système gravitationnel double synchronisé"),
        "de": ("charon", "Plutos massereicher Begleitmond, der ein gebundenes Doppelzwergsystem bildet"),
        "ja": ("カロン", "冥王星と互いに潮汐固定され二重天体システムを形成する巨大な衛星"),
        "ko": ("카론", "명왕성과 서로 같은 면을 마주 보며 이중 행성계를 형성하는 거대 위성"),
        "zh": ("冥卫一", "与冥王星互相潮汐锁定并共同绕质心旋转的巨大伴星")
    },
    {
        "asset": "enceladus",
        "type": "cosmos",
        "pt": ("encelado", "Lua brilhante de Saturno disparando plumas oceânicas de água e vapor ao espaço"),
        "en": ("enceladus", "Saturn's reflective moon venting subsurface ocean plumes directly into space"),
        "fr": ("encelade", "Lune étincelante de Saturne projetant des geysers d'eau vers l'espace"),
        "de": ("enceladus", "Saturns strahlend weißer Eismond, der Wasserdampffontänen ins All schießt"),
        "ja": ("エンケラドス", "南極の虎の縞模様の裂け目から氷と水蒸気の噴煙を宇宙へ放つ土星の氷衛星"),
        "ko": ("엔셀라두스", "얼음 표면 틈새로 지하 바다의 수증기와 물을 우주로 뿜어내는 토성의 위성"),
        "zh": ("土卫二", "表面反射强烈并从冰裂缝向太空喷射液态水汽羽流的土星冰卫星")
    },
    {
        "asset": "ganymede",
        "type": "cosmos",
        "pt": ("ganimedes", "A maior lua de todo o sistema solar maior que o próprio planeta Mercúrio"),
        "en": ("ganymede", "The largest moon in the entire solar system exceeding Mercury in size"),
        "fr": ("ganymede", "La plus grande lune du système solaire surpassant la planète Mercure"),
        "de": ("ganymed", "Der größte Mond des Sonnensystems, der selbst Merkur an Größe übertrifft"),
        "ja": ("ガニメデ", "惑星水星をも上回る大きさを誇り固有の磁場を持つ太陽系最大の巨大衛星"),
        "ko": ("가니메데", "수성보다도 크며 자체 자기장을 보유한 태양계 최대 크기의 위성"),
        "zh": ("木卫三", "体积超越水星且拥有独立磁场的全太阳系最大天然卫星")
    },
    {
        "asset": "asteroid",
        "type": "hazard",
        "pt": ("asteroide", "Corpo rochoso e metálico remanescente da formação planetária orbitando o Sol"),
        "en": ("asteroid", "Rocky and metallic planetary leftover traversing orbits around the Sun"),
        "fr": ("asteroide", "Corps rocheux et métallique vestige de la formation des planètes"),
        "de": ("asteroid", "Felsiger und metallischer Überrest aus der Entstehung des Planetensystems"),
        "ja": ("しょうわくせい", "惑星形成期の残り屑であり金属や岩石で構成された太陽周回天体"),
        "ko": ("소행성", "태양 주위를 공전하는 암석과 금속 성분의 원시 행성 파편 천체"),
        "zh": ("小行星", "在太空中运行且由岩石和金属组成的太阳系早期残留天体")
    },
    {
        "asset": "comet",
        "type": "hazard",
        "pt": ("cometa", "Astro de gelo e poeira que produz uma cauda brilhante ao sublimar perto do Sol"),
        "en": ("comet", "Icy cosmic snowball that outgasses a glowing tail when approaching solar heat"),
        "fr": ("comete", "Corps glacé développant une splendide chevelure lumineuse à l'approche du Soleil"),
        "de": ("komet", "Schweifstern aus Eis und Staub, der nahe der Sonne eine helle Koma bildet"),
        "ja": ("すいせい", "太陽熱によって氷が昇華し美しく輝くガスと塵の尾を引く彗星"),
        "ko": ("혜성", "태양에 접근할 때 얼음이 승화하여 아름다운 가스 꼬리를 남기는 천체"),
        "zh": ("彗星", "接近太阳时冰雪升华并拖出长长辉光彗尾的冰冷天体")
    },
    {
        "asset": "meteor",
        "type": "hazard",
        "pt": ("meteoro", "Trilha de luz ionizada riscando o céu provocada pelo atrito atmosférico de um fragmento"),
        "en": ("meteor", "Streak of ionized light ignited as a space fragment incinerates in atmosphere"),
        "fr": ("meteore", "Traînée lumineuse fulgurante produite par l'incinération d'un débris céleste"),
        "de": ("meteor", "Aufleuchtende Leuchtspur beim feurigen Verglühen eines Partikels in der Atmosphäre"),
        "ja": ("りゅうせい", "大気圏への突入摩擦によって発光し夜空を一瞬で切り裂く流れ星"),
        "ko": ("유성", "우주 파편이 대기권에 고속으로 진입하여 마찰열로 번쩍이는 별똥별"),
        "zh": ("流星", "宇宙尘埃或碎片高速冲入大气层剧烈燃烧划过的绚丽光迹")
    },
    {
        "asset": "meteorite",
        "type": "hazard",
        "pt": ("meteorite", "Rocha extraterrestre sobrevivente que atravessa a atmosfera e colide com o solo"),
        "en": ("meteorite", "Extraterrestrial rock survivor that endures atmospheric entry and strikes ground"),
        "fr": ("meteorite", "Roc spatial rescapé de la rentrée atmosphérique percutant la surface"),
        "de": ("meteorit", "Extraterrestrischer Gesteinsbrocken, der den Sturz übersteht und einschlägt"),
        "ja": ("いんせき", "大気圏の超高温を耐え抜いて地表へと衝突した実物の地球外岩石"),
        "ko": ("운석", "대기권의 마찰을 뚫고 지표면에 직접 도달하여 충돌한 외계 암석"),
        "zh": ("陨石", "穿越大气层灼热摩擦后幸存并最终撞击行星地表的宇宙岩体")
    },
    {
        "asset": "bolide",
        "type": "hazard",
        "pt": ("bolido", "Meteoro excepcionalmente brilhante e explosivo detonando como uma bola de fogo cósmica"),
        "en": ("bolide", "Extremely bright exploding fireball meteor detonating in the sky"),
        "fr": ("bolide", "Météore exceptionnellement brillant explosant dans une boule de feu cataclysmique"),
        "de": ("bolid", "Außergewöhnlich heller Feuerballmeteor, der mit lauter Druckwelle zerbirst"),
        "ja": ("かきゅう", "大気中で轟音と共に激しく大爆発を起こす極めて高輝度な巨大火球"),
        "ko": ("화구", "대기 속에서 폭발적인 섬광을 내뿜으며 터지는 초고휘도 유성 파이어볼"),
        "zh": ("火流星", "在大气层中发生轰鸣巨响剧烈爆炸的极其明亮特大火球")
    },
    {
        "asset": "fragment",
        "type": "hazard",
        "pt": ("fragmento", "Estilhaço de colisão orbital navegando em trajetória perigosa pelo vácuo"),
        "en": ("fragment", "Collision shrapnel piece navigating a dangerous orbital path through space"),
        "fr": ("fragment", "Éclat tranchant né d'une collision orbitale menaçant la Terre"),
        "de": ("fragment", "Trümmerstück einer Kollision, das unkontrolliert auf Erdkurs driftet"),
        "ja": ("はへん", "宇宙衝突によって飛散し危険な突入軌道をとる鋭利な破片"),
        "ko": ("파편", "천체 충돌로 인해 발생하여 궤도를 떠도는 날카로운 우주 잔해 파편"),
        "zh": ("碎片", "天体高速碰撞撞击产生的在危险轨道上飞行的坚硬碎块")
    },
    {
        "asset": "aerolite",
        "type": "hazard",
        "pt": ("aerolito", "Meteorito composto predominantemente por minerais de silicato e rochas pétreas"),
        "en": ("aerolite", "Stony meteorite composed mainly of silicate minerals and ancient rock"),
        "fr": ("aerolithe", "Météorite pierreuse composée principalement de minéraux silicatés"),
        "de": ("aerolith", "Steinmeteorit, der überwiegend aus uralten Silikatmineralien besteht"),
        "ja": ("せきしついんせき", "ケイ酸塩鉱物を主成分とする太古の石質隕石"),
        "ko": ("석질운석", "규산염 광물을 주성분으로 구성된 우주의 단단한 암석형 운석"),
        "zh": ("石陨石", "主要由硅酸盐矿物组成的岩石质地外天体陨落块")
    },
    {
        "asset": "meteoroid",
        "type": "hazard",
        "pt": ("meteoroide", "Pequeno corpo celeste rochoso no espaço antes de entrar na atmosfera terrestre"),
        "en": ("meteoroid", "Small rocky celestial body traveling in space before atmospheric encounter"),
        "fr": ("meteoroide", "Petit corps rocheux sillonnant l'espace avant son entrée atmosphérique"),
        "de": ("meteoroid", "Kleiner Himmelskörper im All vor dem Kontakt mit der Erdatmosphäre"),
        "ja": ("りゅうせいたい", "大気圏へ突入する前に深宇宙を高速で飛行している小さな母岩天体"),
        "ko": ("유성체", "지구 대기권에 진입하기 전 우주를 고속으로 순항하는 작은 암석 천체"),
        "zh": ("流星体", "在进入行星大气层之前在空间轨道高速穿梭的微小岩体")
    },
    {
        "asset": "boulder",
        "type": "hazard",
        "pt": ("pedregulho", "Bloco colossal de rocha desprendido da superfície de um asteroide gigante"),
        "en": ("boulder", "Colossal rocky monolith dislodged from the surface of a giant asteroid"),
        "fr": ("rocher", "Bloc de roche massif éjecté de la surface d'un astéroïde menaçant"),
        "de": ("felsblock", "Mächtiger Felsbrocken, der sich von einem Riesenasteroiden gelöst hat"),
        "ja": ("きょせき", "巨大な母小惑星から剥ぎ取られ突進してくる高密度の岩塊"),
        "ko": ("암괴", "거대한 소행성 표면에서 떨어져 나와 우주를 질주하는 거대 암괴"),
        "zh": ("巨石", "从巨大小行星表面剥落崩塌并向外飞溅的沉重天体岩块")
    },
    {
        "asset": "satellite",
        "type": "tech",
        "pt": ("satelite", "Artefato tecnológico orbital operando sensores e telecomunicações ao redor da Terra"),
        "en": ("satellite", "Orbital technological spacecraft relaying sensors and data around Earth"),
        "fr": ("satellite", "Appareil orbital déployant antennes et capteurs autour de notre planète"),
        "de": ("satellit", "Umlaufender künstlicher Flugkörper für Kommunikation und Erdbeobachtung"),
        "ja": ("じんこうえいせい", "軌道上で観測機器や通信アンテナを展開し地球を周回する人工天体"),
        "ko": ("인공위성", "지구 궤도를 돌며 정밀 관측과 통신 임무를 수행하는 인공 우주 기기"),
        "zh": ("卫星", "在预定轨道上不知疲倦运行的人造通讯与科学观测航天器")
    },
    {
        "asset": "probe",
        "type": "tech",
        "pt": ("sonda", "Aeronave robótica não tripulada enviada para explorar mundos extraterrestres remotos"),
        "en": ("probe", "Unmanned robotic spacecraft deployed to explore distant extraterrestrial frontiers"),
        "fr": ("sonde", "Véhicule robotique inhabité envoyé sonder les confins du système solaire"),
        "de": ("sonde", "Unbemanntes Roboterfahrzeug zur Erkundung ferner planetarer Grenzen"),
        "ja": ("たんさき", "未踏の惑星や深宇宙の科学探査のために派遣される自律型無人探査機"),
        "ko": ("탐사선", "미지의 행성과 심우주 개척을 위해 발사된 정밀 로봇 무인 탐사선"),
        "zh": ("探测器", "飞往遥远行星与深空执行无人科学探测使命的自动化太空飞行器")
    },
    {
        "asset": "telescope",
        "type": "tech",
        "pt": ("telescopio", "Instrumento de alta precisão que capta luz cósmica de nebulosas e galáxias distantes"),
        "en": ("telescope", "Precision optical instrument capturing cosmic light from distant galaxies"),
        "fr": ("telescope", "Instrument d'observation optique captant la lueur des astres lointains"),
        "de": ("teleskop", "Optisches Präzisionsinstrument zum Auffangen von Photonen ferner Galaxien"),
        "ja": ("ぼうえんきょう", "遥か彼方の星雲や銀河の深遠な光を集光して結像する光学観測装置"),
        "ko": ("망원경", "수십억 광년 떨어진 은하와 성운의 빛을 포착하는 정밀 우주 망원경"),
        "zh": ("望远镜", "捕获宇宙深处星系与微弱星光的尖端光学天文观测设备")
    },
    {
        "asset": "hubble",
        "type": "tech",
        "pt": ("hubble", "O venerável telescópio espacial orbital que transformou a visão humana do cosmos"),
        "en": ("hubble", "The iconic orbital space telescope that revolutionized human view of deep cosmos"),
        "fr": ("hubble", "Le célèbre télescope spatial qui a révolutionné notre regard sur l'univers"),
        "de": ("hubble", "Das legendäre Weltraumteleskop, das den Blick der Menschheit ins All veränderte"),
        "ja": ("ハッブル", "長年にわたり宇宙深部の鮮明な映像を地球へ届け続けた伝説の宇宙望遠鏡"),
        "ko": ("허블", "수십 년간 인류의 눈이 되어 심우주를 경이롭게 담아낸 전설적인 우주망원경"),
        "zh": ("哈勃", "彻底颠覆人类对宇宙深空认知并运行数十年的传奇太空望远镜")
    },
    {
        "asset": "webb",
        "type": "tech",
        "pt": ("webb", "O avançado observatório infravermelho desvendando as primeiras estrelas e galáxias do universo"),
        "en": ("webb", "The premier infrared space observatory peering back at the universe's dawn"),
        "fr": ("webb", "L'observatoire infrarouge de pointe traquant les premières lueurs du cosmos"),
        "de": ("webb", "Das hochmoderne Infrarot-Observatorium am Lagrangepunkt zur Erkundung des Urknalls"),
        "ja": ("ウェッブ", "黄金の六角形主鏡で宇宙黎明期の光を捉える最新鋭赤外線宇宙望遠鏡"),
        "ko": ("웹", "거대한 금빛 주경으로 우주 초기의 빛과 외계행성을 탐색하는 차세대 망원경"),
        "zh": ("韦伯", "配备巨大黄金镜面捕捉宇宙初生微光与系外大气的先进红外太空望远镜")
    },
    {
        "asset": "voyager",
        "type": "tech",
        "pt": ("voyager", "A lendária sonda espacial que cruzou a fronteira heliosférica rumo ao espaço interestelar"),
        "en": ("voyager", "The interstellar messenger probe that ventured beyond our solar threshold"),
        "fr": ("voyager", "La sonde légendaire devenue le premier artefact humain dans l'espace interstellaire"),
        "de": ("voyager", "Die legendäre Sonde, die als erstes Menschenwerk in den interstellaren Raum vorstieß"),
        "ja": ("ボイジャー", "ゴールデンレコードを携え太陽系境界面を越えて恒星間航行を続ける探査機"),
        "ko": ("보이저", "황금 레코드를 싣고 태양계 경계를 넘어 성간 공간으로 항해 중인 무인 탐사선"),
        "zh": ("旅行者", "携带镀金唱片并已飞出太阳系疆界进入星际空间的宏大探测先驱")
    },
    {
        "asset": "sputnik",
        "type": "tech",
        "pt": ("sputnik", "A pioneira esfera metálica que inaugurou oficialmente a era espacial da humanidade"),
        "en": ("sputnik", "The historical metal satellite that heralded the dawn of human space exploration"),
        "fr": ("spoutnik", "La sphère métallique pionnière qui ouvrit officiellement l'ère spatiale"),
        "de": ("sputnik", "Der metallene Pioniersatellit, der das Zeitalter der Raumfahrt einleitete"),
        "ja": ("スプートニク", "人類史上初めて地球周回軌道への投入に成功した記念碑的第一号人工衛星"),
        "ko": ("스푸트니크", "인류 최초로 지구 궤도를 돌며 우주 시대의 개막을 알린 금속구 인공위성"),
        "zh": ("伴侣号", "成功进入地球轨道并开启人类太空探索全新纪元的开创性人造卫星")
    },
    {
        "asset": "rocket",
        "type": "tech",
        "pt": ("foguete", "Poderoso veículo impulsionado por motores de combustível químico vencendo a gravidade"),
        "en": ("rocket", "Mighty reaction thruster vehicle roaring upwards to overcome planetary gravity"),
        "fr": ("fusee", "Puissant propulseur crachant des flammes incandescentes pour quitter l'orbite"),
        "de": ("rakete", "Mächtiges Trägersystem, das durch chemischen Schub die Schwerkraft überwindet"),
        "ja": ("ロケット", "強烈な推進燃焼エネルギーで地球の重力を振り切る巨大打ち上げ機"),
        "ko": ("로켓", "엄청난 추진력을 폭발시켜 지구 중력을 탈출하는 다단식 우주 발사체"),
        "zh": ("火箭", "依靠狂暴尾喷推力克服行星重力并冲向苍穹的多级太空推进运载载具")
    },
    {
        "asset": "capsule",
        "type": "tech",
        "pt": ("capsula", "Módulo aerodinâmico pressurizado com escudo térmico para reentrada segura"),
        "en": ("capsule", "Pressurized aerodynamic craft fitted with heat shields for orbital re-entry"),
        "fr": ("capsule", "Habitacle pressurisé profilé doté d'un bouclier thermique de rentrée"),
        "de": ("kapsel", "Druckfeste aerodynamische Landekapsel mit Hitzeschild für den Wiedereintritt"),
        "ja": ("カプセル", "強固な耐熱シールドを備え大気圏再突入を可能にする与圧式帰還カプセル"),
        "ko": ("캡슐", "고열의 대기권 재돌입을 견디도록 열차폐 실드를 장착한 우주선 캡슐"),
        "zh": ("太空舱", "配备坚固防热盾以抵御剧烈大气再入超高温摩擦的密闭式航天乘员舱")
    },
    {
        "asset": "module",
        "type": "tech",
        "pt": ("modulo", "Segmento estrutural interconectável de uma estação ou complexo orbital"),
        "en": ("module", "Interchangeable structural compartment of an expanding orbital base"),
        "fr": ("module", "Compartiment structural pressurisé d'un complexe orbital modulaire"),
        "de": ("modul", "Verbindungsfähiges Nutzlastsegment eines modularen Orbitalstützpunkts"),
        "ja": ("モジュール", "ドッキングポートを備え軌道上基地を拡張する機能単位ブロック"),
        "ko": ("모듈", "도킹 포트로 연결되어 우주정거장을 확장하는 정밀 가압식 거주 모듈"),
        "zh": ("舱段", "通过标准化气密对接口拼接扩展空间站功能的加压结构单元")
    },
    {
        "asset": "rover",
        "type": "tech",
        "pt": ("rover", "Veículo robótico motorizado com rodas desenhado para atravessar terrenos extraterrestres"),
        "en": ("rover", "Automated wheeled exploration rover roving alien dusty surface terrains"),
        "fr": ("rover", "Véhicule motorisé autonome conçu pour arpenter les sols d'autres mondes"),
        "de": ("rover", "Autonomes Roboterfahrzeug mit Spezialrädern für außerirdische Landschaften"),
        "ja": ("ローバー", "不整地踏破タイヤと分析アームを備え地球外の荒野を走破する探査車"),
        "ko": ("로버", "다양한 과학 분석 장비와 바퀴를 장착하여 행성 표면을 누비는 탐사 로버"),
        "zh": ("漫游车", "配备多地形驱动轮与科学探测机械臂的自动化地外行星巡视车")
    },
    {
        "asset": "ship",
        "type": "tech",
        "pt": ("nave", "Embarcação aeroespacial tripulada dotada de propulsores de manobra no vácuo"),
        "en": ("ship", "Spacefaring vessel navigated by maneuvering thrusters across the solar sea"),
        "fr": ("vaisseau", "Vaisseau d'exploration interstellaire propulsé par réacteurs à plasma"),
        "de": ("raumschiff", "Bemanntes Flugschiff mit Manövrierdüsen zum Reisen durch das Sternenmeer"),
        "ja": ("うちゅうせん", "恒星間推進エンジンと姿勢制御スラスターを備えた有人宇宙船"),
        "ko": ("우주선", "자세 제어 추진기와 주 추진엔진으로 성간을 유영하는 유인 탐사 우주선"),
        "zh": ("飞船", "配备姿态控制喷口与强大主推进引擎穿梭于太空间隙的航天载具")
    },
    {
        "asset": "drone",
        "type": "tech",
        "pt": ("drone", "Aeronave autônoma ultraleve de reconhecimento monitorando perigos no espaço"),
        "en": ("drone", "Lightweight autonomous scout craft scanning orbital paths for hazards"),
        "fr": ("drone", "Engin éclaireur autonome ultra-léger traquant les anomalies orbitales"),
        "de": ("drohne", "Autonomer leichter Aufklärungsflugkörper zur Überwachung orbitaler Gefahren"),
        "ja": ("ドローン", "自律AIセンサーで周囲を哨戒し小惑星帯の危険を索敵する探査ドローン"),
        "ko": ("드론", "자율 제어 시스템으로 소행성과 파편 궤도를 신속히 정찰하는 우주 드론"),
        "zh": ("无人机", "搭载智能光学传感器并在空间轨道自主进行危险侦察的小型无人机")
    },
    {
        "asset": "starship",
        "type": "tech",
        "pt": ("astronave", "Nave colossal de longo alcance armada com propulsão interestelar hiperavançada"),
        "en": ("starship", "Colossal long-range star cruiser outfitted with advanced stellar warp drives"),
        "fr": ("astronef", "Croiseur interstellaire lourd doté de propulseurs à distorsion de pointe"),
        "de": ("sternenschiff", "Gewaltiges Langstrecken-Sternenschiff mit hochentwickeltem Hyperantrieb"),
        "ja": ("せいかんせん", "光速域航行を可能にするワープ機関を搭載した超長距離大型星間巡洋艦"),
        "ko": ("성간우주선", "초광속 도약 드라이브를 탑재하여 성간 심연을 건너는 거대 주력함"),
        "zh": ("星舰", "装载尖端曲速引擎可跨越恒星系深邃鸿沟的巨型主力星际巡洋战舰")
    },
    {
        "asset": "space_shuttle",
        "type": "tech",
        "pt": ("onibus-espacial", "Veículo aeroespacial reutilizável com asas capaz de pousar como planador"),
        "en": ("shuttle", "Reusable delta-wing orbiter capable of gliding back down to runway touchdown"),
        "fr": ("navette", "Navette spatiale ailée réutilisable atterrissant en vol plané sur Terre"),
        "de": ("raumfahre", "Wiederverwendbare geflügelte Raumfähre, die gleitend zur Erde zurückkehrt"),
        "ja": ("スペースシャトル", "大気圏再突入後に巨大な翼で滑空着陸する再使用型軌道宇宙往還機"),
        "ko": ("우주왕복선", "활주로에 무동력 활공으로 착륙하는 날개를 지닌 재사용 가능한 우주 왕복선"),
        "zh": ("航天飞机", "完成轨道任务后凭借宽大机翼在大气中滑翔降落跑道的可重复使用航天器")
    },
    {
        "asset": "space_station",
        "type": "tech",
        "pt": ("estacao-espacial", "Complexo habitável permanente no espaço mantendo tripulações em microgravidade"),
        "en": ("space-station", "Permanent orbital habitat housing scientific crew members in microgravity"),
        "fr": ("station-spatiale", "Immense habitat orbital permanent accueillant des astronautes chercheurs"),
        "de": ("raumstation", "Permanente Forschungsstadt im Orbit für Langzeitaufenthalte in Schwerelosigkeit"),
        "ja": ("うちゅうステーション", "微小重力環境下で各国の科学者が長期滞在研究を行う巨大複合宇宙基地"),
        "ko": ("우주정거장", "무중력 상태에서 장기간 머물며 과학 연구를 수행하는 거대 궤도 기지"),
        "zh": ("空间站", "常年驻留微重力轨道并为航天员提供科研与生活保障的巨型轨道复合基地")
    },
    {
        "asset": "star",
        "type": "cosmos",
        "pt": ("estrela", "Esfera brilhante de plasma superaquecido sustentada por contínuas reações de fusão nuclear"),
        "en": ("star", "Luminous celestial sphere of blistering plasma powered by nuclear fusion core"),
        "fr": ("etoile", "Fournaise cosmique de plasma incandescent entretenue par la fusion nucléaire"),
        "de": ("stern", "Gewaltiger Plasmaball im Kosmos, der durch kontinuierliche Kernfusion strahlt"),
        "ja": ("ほし", "中心核の激しい熱核融合反応によって眩い光と熱を放ち続ける恒星"),
        "ko": ("별", "핵융합 반응의 막대한 에너지를 방출하며 우주를 환하게 밝히는 백열의 항성"),
        "zh": ("恒星", "由核心剧烈热核聚变反应持续供能并向宇宙辐射刺目光热的等离子体天体")
    },
    {
        "asset": "galaxy",
        "type": "cosmos",
        "pt": ("galaxia", "Colossal redemoinho gravitacional abrigando centenas de bilhões de estrelas e nebulosas"),
        "en": ("galaxy", "Colossal gravitational whirlpool uniting hundreds of billions of shining stars"),
        "fr": ("galaxie", "Tourbillon gravitationnel réunissant des centaines de milliards d'étoiles"),
        "de": ("galaxie", "Majestätischer gravitativer Strudel aus hunderten Milliarden funkelnder Sonnen"),
        "ja": ("ぎんが", "数千億もの星々と星間物質が巨大な重力で束ねられた壮麗な回転渦巻銀河"),
        "ko": ("은하", "수천억 개의 항성과 성운들이 중심 블랙홀 주위로 모여 회전하는 은하계"),
        "zh": ("星系", "由千百亿颗恒星、气体云与暗物质受万有引力紧密维系的浩瀚宇宙岛")
    },
    {
        "asset": "nebula",
        "type": "cosmos",
        "pt": ("nebulosa", "Monumental nuvem interestelar de poeira e gás ionizado onde novos sóis florescem"),
        "en": ("nebula", "Monumental interstellar cradle of dust and glowing gas where baby stars ignite"),
        "fr": ("nebuleuse", "Gigantesque nuage cosmique de gaz luminescent berceau de nouveaux mondes"),
        "de": ("nebel", "Gigantische interstellare Gas- und Staubwolke als schimmernde Sternenwiege"),
        "ja": ("せいうん", "息をのむほど鮮やかなガスと星間塵が漂い新たな恒星が誕生する星雲"),
        "ko": ("성운", "새로운 별들이 태어나는 찬란하고 거대한 우주 가스와 먼지의 성간 요람"),
        "zh": ("星云", "弥漫于星际空间中孕育全新恒星胚胎与绚丽色彩的璀璨气体尘埃云")
    },
    {
        "asset": "supernova",
        "type": "fenomeno",
        "pt": ("supernova", "Explosão terminal violenta de estrela massiva liberando o brilho de uma galáxia inteira"),
        "en": ("supernova", "Cataclysmic stellar detonation briefly outshining the light of entire galaxies"),
        "fr": ("supernova", "Déflagration cosmique titanesque d'une étoile agonisante illuminant l'espace"),
        "de": ("supernova", "Gigantische Sternexplosion am Lebensende, die eine ganze Galaxie überstrahlt"),
        "ja": ("ちょうしんせい", "一生を終えた大質量星が銀河全体の明るさを凌駕して大爆発する現象"),
        "ko": ("초신성", "수명을 다한 거대 항성이 은하 전체보다 밝은 빛을 뿜어내며 폭발하는 현상"),
        "zh": ("超新星", "大质量恒星演化末期发生剧烈大坍缩并短暂照亮整个星系的毁灭性大爆炸")
    },
    {
        "asset": "pulsar",
        "type": "cosmos",
        "pt": ("pulsar", "Estrela de nêutrons ultracompacta girando freneticamente emitindo feixes regulares de radiação"),
        "en": ("pulsar", "Hyperdense neutron star spinning wildly and sweeping beams of rhythmic radiation"),
        "fr": ("pulsar", "Étoile à neutrons hyperdense balayant l'espace de faisceaux réguliers"),
        "de": ("pulsar", "Rasend rotierender Neutronenstern, der rhythmische Strahlungskegel aussendet"),
        "ja": ("パルサー", "超高速で自転し規則正しい電波パルスを灯台のように放つ超高密度中性子星"),
        "ko": ("펄서", "초당 수백 회 회전하며 규칙적인 전자기파 펄스를 등대처럼 쏘는 중성자별"),
        "zh": ("脉冲星", "疯狂自转并如宇宙灯塔般向两极周期性扫射高能辐射束的超致密中子星")
    },
    {
        "asset": "quasar",
        "type": "cosmos",
        "pt": ("quasar", "Núcleo galáctico primordial hiperativo impulsionado por buraco negro supermassivo faminto"),
        "en": ("quasar", "Primeval luminous galaxy core fed by an insatiable supermassive black hole"),
        "fr": ("quasar", "Noyau galactique primordial éblouissant alimenté par un trou noir vorace"),
        "de": ("quasar", "Extrem leuchtstarker Galaxienkern, angetrieben von einem supermassereichen Schwarzen Loch"),
        "ja": ("クエーサー", "超大質量ブラックホールの降着円盤から莫大なエネルギーを放つ活動銀河核"),
        "ko": ("퀘이사", "초거대 블랙홀이 주변 물질을 집어삼키며 뿜어내는 우주 최강의 활동은하핵"),
        "zh": ("类星体", "由处于早期宇宙的贪婪超大质量黑洞吸积盘驱动的高能极亮天体核心")
    },
    {
        "asset": "magnetar",
        "type": "cosmos",
        "pt": ("magnetar", "Estrela de nêutrons exótica detentora do campo magnético mais extremo do cosmos"),
        "en": ("magnetar", "Exotic neutron star boasting the most terrifying magnetic fields in nature"),
        "fr": ("magnetar", "Étoile à neutrons dotée du champ magnétique le plus dévastateur du cosmos"),
        "de": ("magnetar", "Exotischer Neutronenstern mit dem stärksten Magnetfeld des bekannten Universums"),
        "ja": ("マグネター", "原子構造すら引き裂く宇宙最強の超極限磁場をまとう特殊な中性子星"),
        "ko": ("마그네타", "우주에서 가장 강력한 초극강 자기장을 뿜어내는 경이로운 중성자별"),
        "zh": ("磁星", "具备足以撕碎任何分子原子结构的宇宙极限强磁场的极端致密中子星")
    },
    {
        "asset": "exoplanet",
        "type": "cosmos",
        "pt": ("exoplaneta", "Planeta alienígena orbitando um sol distante além das fronteiras do nosso sistema"),
        "en": ("exoplanet", "Alien planet traversing an alien orbit around a foreign stellar sun"),
        "fr": ("exoplanete", "Monde lointain tournoyant en orbite autour d'une étoile étrangère"),
        "de": ("exoplanet", "Fremder Planet, der um eine ferne Sonne außerhalb unseres Systems kreist"),
        "ja": ("けいがいわくせい", "太陽系の彼方で別の恒星の周りを周回する遥かなる未知の系外惑星"),
        "ko": ("외계행성", "우리 태양계 밖 먼 우주에서 다른 별의 주위를 공전하는 미지의 외계 행성"),
        "zh": ("系外行星", "在太阳系之外环绕其他恒星公转的神秘而遥远的地外行星")
    },
    {
        "asset": "andromeda",
        "type": "cosmos",
        "pt": ("andromeda", "Nossa galáxia espiral gigante vizinha em rota orbital de aproximação cósmica"),
        "en": ("andromeda", "Our colossal spiral sister galaxy hurtling towards mutual cosmic convergence"),
        "fr": ("andromede", "La galaxie spirale géante voisine marchant vers une future fusion cosmique"),
        "de": ("andromeda", "Unsere gewaltige spiralförmige Nachbargalaxie auf Kurs zur kosmischen Verschmelzung"),
        "ja": ("アンドロメダ", "我々の銀河系と将来合体する運命にある夜空で最も雄大な隣接渦巻銀河"),
        "ko": ("안드로메다", "먼 미래 우리 은하와 하나로 합쳐질 운명을 지닌 거대한 나선은하"),
        "zh": ("仙女座", "正以惊人速度向银河系迎面扑来并在数十亿年后发生大碰撞的巨型螺旋星系")
    },
    {
        "asset": "milky_way",
        "type": "cosmos",
        "pt": ("via-lactea", "Nossa majestosa galáxia berço espalhando centenas de bilhões de estrelas pelos seus braços"),
        "en": ("milky-way", "Our sparkling spiral mother galaxy cradle sheltering hundreds of billions of suns"),
        "fr": ("voie-lactee", "Notre galaxie spirale nourricière étirant ses bras d'étoiles scintillantes"),
        "de": ("milchstrasse", "Unsere heimatliche Spiralgalaxie, die hunderte Milliarden Sonnen beherbergt"),
        "ja": ("あまのがわ", "夜空を白い河のように横切り太陽系が属する我らの母なる天の川銀河"),
        "ko": ("은하수", "수천억 개의 별들이 찬란한 나선팔을 이루는 인류의 보금자리 우리은하"),
        "zh": ("银河", "横跨浩瀚夜空并孕育了太阳系与数千亿恒星的璀璨旋臂母星系")
    },
    {
        "asset": "radiation",
        "type": "hazard",
        "pt": ("radiacao", "Fluxo contínuo de ondas eletromagnéticas ou partículas energéticas penetrando o espaço"),
        "en": ("radiation", "High-energy particles and electromagnetic rays streaming through the stellar expanse"),
        "fr": ("rayonnement", "Flux intense de particules énergétiques et rayons ionisants fendant l'espace"),
        "de": ("strahlung", "Energiereiche Teilchenströme und elektromagnetische Wellen im kosmischen Raum"),
        "ja": ("ほうしゃせん", "宇宙空間を音もなく貫通し物質をイオン化する高エネルギー放射線"),
        "ko": ("방사선", "우주 공간을 가로지르며 물질과 에너지를 이온화시키는 고에너지 입자선"),
        "zh": ("辐射", "穿透寂静太空并能电离物质的高能亚原子粒子流与电磁辐射线")
    },
    {
        "asset": "antimatter",
        "type": "hazard",
        "pt": ("antimateria", "Matéria invertida que libera aniquilação energética total ao colidir com matéria comum"),
        "en": ("antimatter", "Mirrored particle substance triggering complete explosive annihilation upon contact"),
        "fr": ("antimatiere", "Matière inversée produisant une annihilation énergétique pure au contact de la matière"),
        "de": ("antimaterie", "Spiegelbildliche Teilchenmaterie, die sich bei Berührung explosiv zerstrahlt"),
        "ja": ("はんぶっしつ", "通常物質と接触した瞬間に純粋な光エネルギーへと対消滅する鏡像物質"),
        "ko": ("반물질", "일반 물질과 접촉하는 순간 질량을 순수 에너지로 100% 폭발시키는 반입자"),
        "zh": ("反物质", "与常规正物质粒子接触便会以百分之百质能转换发生剧烈湮灭的神秘镜像物质")
    },
    {
        "asset": "black_hole",
        "type": "hazard",
        "pt": ("buraco-negro", "Singularidade com gravidade avassaladora de onde absolutamente nada nem a luz escapa"),
        "en": ("black-hole", "Gravitational abyss with gravity so fierce that not even light photons can escape"),
        "fr": ("trou-noir", "Abîme gravitationnel impénétrable d'où même la lumière ne peut jamais fuir"),
        "de": ("schwarzes-loch", "Gravitativer Schlund im Raum-Zeit-Gefüge, dem selbst Photonen nicht entkommen"),
        "ja": ("ブラックホール", "無限の重力で時空を歪め光すら脱出できない暗黒の究極天体"),
        "ko": ("블랙홀", "시공간을 무한히 왜곡시켜 빛조차 빠져나오지 못하는 우주 최강의 중력 심연"),
        "zh": ("黑洞", "中心引力强大到连宇宙最快的光子也无法逃逸的极端时空坍缩深渊")
    },
    {
        "asset": "wormhole",
        "type": "cosmos",
        "pt": ("buraco-de-minhoca", "Túnel quântico teórico dobrando o espaço-tempo para conectar dois pontos do cosmos"),
        "en": ("wormhole", "Spacetime bridge warping the cosmic fabric to link two distant sectors instantly"),
        "fr": ("trou-de-ver", "Pont spatio-temporel reliant instantanément deux points distants du cosmos"),
        "de": ("wurmloch", "Theoretischer Tunnel durch die Raumzeit zur Überbrückung kosmischer Distanzen"),
        "ja": ("ワームホール", "時空の布地を折り畳み遥か遠方の宇宙同士を直結する理論上の時空トンネル"),
        "ko": ("웜홀", "시공간을 접어 아득히 먼 두 지점을 순식간에 연결하는 가상의 우주 통로"),
        "zh": ("虫洞", "弯曲时空纤维并在瞬间连通宇宙两个遥远维度的爱因斯坦-罗森桥时空隧道")
    },
    {
        "asset": "astronaut",
        "type": "tech",
        "pt": ("astronauta", "Explorador humano treinado em traje pressurizado para conduzir missões além da Terra"),
        "en": ("astronaut", "Trained space voyager clad in pressurized EVA gear exploring beyond Earth"),
        "fr": ("astronaute", "Pionnier des étoiles équipé d'une combinaison pressurisée en apesanteur"),
        "de": ("astronaut", "Trainierter Raumfahrer im Schutzanzug für gefährliche Missionen im All"),
        "ja": ("うちゅうひこうし", "船外活動宇宙服を身にまとい漆黒の宇宙空間で作業を行う勇敢な探検者"),
        "ko": ("우주비행사", "생명유지 우주복을 입고 지구 밖 미지의 세계로 나아가는 우주 개척자"),
        "zh": ("宇航员", "身穿高可靠生命保障舱外航天服并远征茫茫星海的勇敢太空探索者")
    },
    {
        "asset": "cosmonaut",
        "type": "tech",
        "pt": ("cosmonauta", "Navegador dos mares cósmicos qualificado para pilotar espaçonaves em órbita"),
        "en": ("cosmonaut", "Certified cosmic navigator steering space vessels through orbital currents"),
        "fr": ("cosmonaute", "Pilote spatial chevronné manœuvrant les modules de vol en orbite"),
        "de": ("kosmonaut", "Ausgebildeter Raumflieger zum Steuern von Raumfahrzeugen im Orbit"),
        "ja": ("コスモノート", "数々の過酷な軌道飛行訓練を乗り越え船団を指揮する宇宙航行士"),
        "ko": ("코스모너트", "궤도 우주선 조종과 정거장 임무를 수행하는 노련한 전문 우주 비행사"),
        "zh": ("航天员", "操纵复杂飞船航电系统并执行严酷长期空间飞行的专业航天领航员")
    },
    {
        "asset": "white_dwarf",
        "type": "cosmos",
        "pt": ("ana-branca", "Resíduo estelar ultradenso de carbono e oxigênio brilhando suavemente no vácuo"),
        "en": ("white-dwarf", "Dense glowing cinder core left behind after a sun shedding outer gas layers"),
        "fr": ("naine-blanche", "Cadavre stellaire compact et incandescent vestige d'une étoile éteinte"),
        "de": ("weisser-zwerg", "Kompakter Glutkern eines erloschenen Sterns, der langsam ins Dunkel abkühlt"),
        "ja": ("はくしょくわいせい", "外層を放出した恒星の燃え滓であり地球大に凝縮された超高密度な残骸"),
        "ko": ("백색왜성", "수명이 다한 별이 외피를 날려보내고 지구 크기로 응축된 초고밀도 잔해"),
        "zh": ("白矮星", "中低质量恒星褪去外层气体外壳后遗留下的地球大小致密炽热恒星遗骸")
    },
    {
        "asset": "red_giant",
        "type": "cosmos",
        "pt": ("gigante-vermelha", "Estrela colossal em fase avançada que inflou centenas de vezes engolindo órbitas"),
        "en": ("red-giant", "Elderly swelling star bloated to monstrous proportions swallowing inner planets"),
        "fr": ("geante-rouge", "Étoile colossale en fin de vie enflée au point d'engloutir les planètes proches"),
        "de": ("roter-riese", "Alter aufgeblähter Stern gigantischen Ausmaßes vor dem finalen Hüllenabstoß"),
        "ja": ("せきしょくきょせい", "燃料が尽きかけ数百倍に巨大化して周囲の惑星を飲み込む晩年の巨星"),
        "ko": ("적색거성", "중심부 수소 고갈로 수백 배 팽창하여 내부 행성을 집어삼키는 노년기 항성"),
        "zh": ("红巨星", "核心氢燃料耗尽后剧烈膨胀数百倍并吞噬内侧近地行星的垂暮巨型恒星")
    },
    {
        "asset": "solar_probe",
        "type": "tech",
        "pt": ("sonda-solar", "Nave armada com escudo de carbono refratário mergulhando na atmosfera da coroa solar"),
        "en": ("solar-probe", "Heat-shielded probe diving deep into the blistering solar corona atmosphere"),
        "fr": ("sonde-solaire", "Vaisseau blindé plongeant audacieusement au cœur de la fournaise de la couronne"),
        "de": ("sonnensonde", "Hitzegeschützte Forschungssonde, die tief in die glühende Korona eintaucht"),
        "ja": ("たいようたんさき", "特殊カーボン耐熱盾で灼熱のコロナに突入し太陽嵐の源流を解明する探査機"),
        "ko": ("태양탐사선", "초고온의 태양 대기 코로나 속으로 뛰어들어 태양풍의 비밀을 밝히는 탐사선"),
        "zh": ("太阳探测器", "装配重型碳复合防热盾深入数百万度日冕炽热海洋的先锋科考探测器")
    },
    {
        "asset": "lunar_module",
        "type": "tech",
        "pt": ("modulo-lunar", "Nave aranha de descida orbital especialmente projetada para alunissar suavemente"),
        "en": ("lunar-module", "Spidery lander craft engineered to touch down gently on cratered lunar soil"),
        "fr": ("module-lunaire", "Vaisseau d'alunissage à pattes rétractables conçu pour toucher le régolithe"),
        "de": ("mondlandefahre", "Spinnenartige Landefähre zum sanften Aufsetzen auf staubigem Mondboden"),
        "ja": ("つきちゃくりくせん", "4本の着陸脚を展開してクレーターだらけの月面へ軟着陸する着陸船"),
        "ko": ("달착륙선", "4개의 완충 다리로 거친 월면에 충격을 흡수하며 사뿐히 내려앉는 착륙선"),
        "zh": ("登月舱", "伸展四条缓冲着陆腿并在月面环形山月壤上平稳实施软着陆的登月飞船")
    },
    {
        "asset": "giant_asteroid",
        "type": "hazard",
        "pt": ("asteroide-gigante", "Muralha rochosa de centenas de quilômetros capaz de provocar extinções planetárias"),
        "en": ("giant-asteroid", "Multi-kilometer space megastructure rock capable of extinction-level impacts"),
        "fr": ("asteroide-geant", "Monolithe spatial démesuré capable de provoquer une extinction planétaire"),
        "de": ("riesenasteroid", "Kilometerbreiter Riesenbrocken mit verheerendem Zerstörungspotenzial"),
        "ja": ("きょだいしょうわくせい", "直撃すれば惑星規模の大絶滅を引き起こす直径数十キロの怪物小惑星"),
        "ko": ("거대소행성", "충돌 시 행성 생태계를 파괴할 수 있는 수십 킬로미터급 거대 소행성"),
        "zh": ("巨大小行星", "一旦正面撞击便能触发全球物种大灭绝的百公里级巨型空间岩石巨兽")
    },
    {
        "asset": "orbital_station",
        "type": "tech",
        "pt": ("base-orbital", "Fortaleza estelar ancorada em órbita geoestacionária para suprimento e reparos"),
        "en": ("orbital-base", "Geostationary space hub station managing heavy starship docking and refuel"),
        "fr": ("base-orbitale", "Bastion stellaire géostationnaire ravitaillant les flottes interplanétaires"),
        "de": ("orbitalbasis", "Schwere geostationäre Raumfestung zur Wartung und Betankung der Flotte"),
        "ja": ("きどうきし", "静止軌道上に固定され船団への補給や整備修理を統括する巨大軌道要塞基地"),
        "ko": ("궤도기지", "정지궤도에 위치하여 우주선 재보급과 정비 수리를 총괄하는 거점 기지"),
        "zh": ("轨道基地", "牢牢锚定在地球静止轨道上为大型舰队提供补给与维修支持的太空枢纽堡垒")
    },
    {
        "asset": "trojan_asteroid",
        "type": "hazard",
        "pt": ("asteroide-troiano", "Aglomerado rochoso estável aprisionado nos pontos lagrangianos de um planeta"),
        "en": ("trojan-asteroid", "Rock locked in gravitational balance at planetary Lagrange orbital pockets"),
        "fr": ("asteroide-troyen", "Astéroïde prisonnier des points de Lagrange équilibrés par la gravité"),
        "de": ("trojaner-asteroid", "In den Lagrangepunkten eines Riesenplaneten gefangener Asteroid"),
        "ja": ("トロヤぐんしょうわくせい", "惑星と太陽のラグランジュ点に長年捕らわれ安定軌道を保つ小惑星"),
        "ko": ("트로이소행성", "행성과 태양의 라그랑주 점에 영구히 갇혀 공전 궤도를 함께하는 소행성"),
        "zh": ("特洛伊小行星", "在行星与恒星形成的拉格朗日平衡点附近保持稳定同步轨道的特殊小行星")
    },
    {
        "asset": "orbital_telescope",
        "type": "tech",
        "pt": ("telescopio-orbital", "Olho artificial além das distorções da atmosfera capturando imagens ultranítidas"),
        "en": ("orbital-telescope", "Atmosphere-free celestial spyglass photographing pristine cosmic depths"),
        "fr": ("telescope-orbital", "Observatoire orbital s'affranchissant des turbulences de l'atmosphère"),
        "de": ("orbitalteleskop", "Weltraumspäher oberhalb der Atmosphäre für gestochen scharfe All-Bilder"),
        "ja": ("きどうぼうえんきょう", "大気の揺らぎを完全に排除した軌道上から銀河を鮮明に捉える観測鏡"),
        "ko": ("궤도망원경", "대기 왜곡을 피해 우주 궤도에서 가장 선명한 천체 사진을 촬영하는 망원경"),
        "zh": ("轨道望远镜", "彻底摆脱大气扰动模糊并在真空中拍摄极端锐利宇宙细节的轨道天文镜")
    },
    {
        "asset": "space_capsule",
        "type": "tech",
        "pt": ("capsula-espacial", "Cápsula de resgate e transporte de carga projetada para travessias espaciais"),
        "en": ("space-capsule", "Autonomous crew transport capsule engineered for robust interplanetary transit"),
        "fr": ("capsule-spatiale", "Habitacle de transport et sauvetage spatial conçu pour les longs voyages"),
        "de": ("raumkapsel", "Druckfeste Rettungs- und Transportkapsel für interplanetare Übergänge"),
        "ja": ("うちゅうカプセル", "乗組員を安全に保護し惑星間を往還する高強度気密宇宙カプセル"),
        "ko": ("우주캡슐", "승무원을 우주 방사선으로부터 보호하며 물자를 수송하는 밀폐형 캡슐"),
        "zh": ("空间太空舱", "专为载人深空穿梭与紧急逃逸设计的高气密高强度模块化运输乘员舱")
    },
    {
        "asset": "rover_vehicle",
        "type": "tech",
        "pt": ("veiculo-rover", "Plataforma móvel científica autônoma perfurando solos alienígenas em busca de dados"),
        "en": ("rover-vehicle", "Robotic all-terrain planetary crawler drilling rock cores on alien surfaces"),
        "fr": ("vehicule-rover", "Plateforme mobile scientifique forant le sol pour déceler des minéraux"),
        "de": ("rover-fahrzeug", "Schweres robotisches Geländefahrzeug zur Entnahme außerirdischer Bohrkerne"),
        "ja": ("たんさしゃ", "ドリルと質量分析器を搭載し異星の岩石を破砕調査する全地形対応探査車両"),
        "ko": ("탐사차량", "드릴로 외계 암석을 채취하고 성분을 분석하는 6륜 구동 로봇 탐사차량"),
        "zh": ("巡视漫游车", "搭载地质取样钻机与光谱仪在荒凉地外地表实地采样的重型全地形巡视车")
    },
    {
        "asset": "freighter",
        "type": "tech",
        "pt": ("cargueiro-espacial", "Enorme nave mercantil de transporte de minérios preciosos entre colônias espaciais"),
        "en": ("space-freighter", "Massive interstellar merchant hauler shipping raw mineral ore containers"),
        "fr": ("cargo-spatial", "Mastodonte cargo de l'espace acheminant des minerais précieux de colonie en colonie"),
        "de": ("raumfrachter", "Kolossales Handelstransportschiff für Massengüter zwischen den Kolonien"),
        "ja": ("かくもつせん", "採掘基地から精錬鉱石コンテナを大量に惑星間輸送する超大型宇宙貨物船"),
        "ko": ("우주화물선", "소행성 광산에서 채굴한 희귀 광물 컨테이너를 운송하는 초대형 우주 화물선"),
        "zh": ("太空货船", "穿行于采矿星带与太空定居点之间运送海量稀有矿石集装箱的重型星际货轮")
    }
]

assert len(CONCEPTS) == 75, f"Expected 75 concepts, got {len(CONCEPTS)}"

# Thematic index partitions for boss word sets (15 words each)
BOSS_THEMATIC_INDICES = {
    'alien_dreadnought': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 23, 24, 25, 26, 27],
    'alien_hive':        [2, 14, 15, 23, 24, 25, 26, 27, 28, 29, 30, 31, 68, 70, 44],
    'alien_psionic':     [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 64, 65, 48],
    'alien_warlord':     [39, 40, 41, 42, 43, 44, 45, 46, 47, 62, 63, 66, 67, 72, 74],
    'alien_darkmatter':   [52, 53, 54, 58, 59, 60, 61, 50, 51, 23, 27, 28, 64, 65, 68],
    'alien_mothership':  [45, 46, 47, 69, 71, 72, 73, 74, 32, 33, 34, 35, 36, 37, 38],
    'robot':             [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 71, 73],
    'beast':             [2, 23, 24, 25, 26, 27, 28, 29, 30, 31, 68, 70, 13, 14, 15],
    'mythology':         [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17],
    'volcano':           [6, 17, 25, 26, 27, 28, 29, 58, 59, 65, 2, 23, 30, 31, 68],
    'ocean':             [5, 13, 16, 18, 21, 22, 10, 24, 28, 32, 33, 43, 47, 74, 1],
    'cosmos':            [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 60, 61, 64, 65, 0]
}

def update_locale(lang_code, base_path):
    file_path = os.path.join(base_path, 'locales', f'{lang_code}.json')
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Build word list
    words_list = []
    for c in CONCEPTS:
        text, meaning = c[lang_code]
        words_list.append({
            "text": text,
            "type": c["type"],
            "meaning": meaning,
            "asset": c["asset"]
        })
    data["words"] = words_list

    # 2. Build bossWords list referencing word indices (Single Source of Truth)
    data["bossWords"] = BOSS_THEMATIC_INDICES

    raw_json = json.dumps(data, ensure_ascii=False, indent=2)
    # Format bossWords index arrays onto a single line each for clean visual readability
    formatted_json = re.sub(
        r'\[\s+([0-9,\s]+?)\s+\]',
        lambda m: '[' + ', '.join(x.strip().rstrip(',') for x in m.group(1).split() if x.strip()) + ']',
        raw_json
    ) + '\n'

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(formatted_json)
    print(f"Updated {file_path}: 75 words and {len(BOSS_THEMATIC_INDICES)} boss word index sets (single source of truth).")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for lang in ['pt', 'en', 'fr', 'de', 'ja', 'ko', 'zh']:
        update_locale(lang, base_dir)

if __name__ == '__main__':
    main()
