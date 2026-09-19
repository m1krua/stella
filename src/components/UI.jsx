import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../lib/i18n'

export function Icon({ name, size = 20, ...props }) {
  const Component = Icons[name] || Icons.Circle
  return <Component size={size} strokeWidth={1.7} {...props} />
}

export function Button({ children, variant = 'primary', to, type = 'button', icon, ...props }) {
  const content = <>{children}{icon && <Icon name={icon} size={17} />}</>
  if (to) return <Link className={`button button-${variant}`} to={to} {...props}>{content}</Link>
  return <button className={`button button-${variant}`} type={type} {...props}>{content}</button>
}

export function SectionTitle({ eyebrow, title, text, align = 'left' }) {
  return <div className={`section-title ${align === 'center' ? 'section-title-center' : ''}`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>
}

export function StatusBadge({ status }) {
  const tone = status === 'Готово' || status === 'Доступен' ? 'success' : status === 'Отменена' ? 'error' : 'neutral'
  return <span className={`status status-${tone}`}><span className="status-dot" />{status}</span>
}

export function Toast({ message, onClose }) {
  if (!message) return null
  return <div className="toast" role="status"><Icon name="CircleCheck" size={18} /><span>{message}</span><button aria-label="Закрыть уведомление" onClick={onClose}><Icon name="X" size={16} /></button></div>
}

export function FAQ() {
  const [open, setOpen] = useState(null)
  const { t } = useLanguage()
  const items = [
    ['Как рассчитывается стоимость?', 'Стоимость зависит от языковой пары, объёма, сложности, сроков и дополнительных требований. После заявки менеджер подготовит индивидуальный расчёт.'],
    ['Какие форматы файлов можно отправить?', 'PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, JPG и PNG.'],
    ['Сколько занимает перевод?', 'Срок зависит от объёма и задачи. Точный срок мы указываем после оценки материалов.'],
    ['Работаете ли вы с юридическими документами?', 'Да, мы принимаем юридические документы и подбираем специалиста с нужной экспертизой.'],
    ['Можно ли заказать срочный перевод?', 'Да, сообщите желаемый срок в заявке, и мы проверим доступность команды.'],
    ['Как обеспечивается конфиденциальность?', 'Материалы доступны только участникам проекта. Для рабочих процессов предусмотрена интеграция с защищённым хранилищем.'],
  ]
  return <div className="faq-list">{items.map(([question, answer], index) => <div className={`faq-item ${open === index ? 'faq-open' : ''}`} key={question}><button onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}><span>{t(question)}</span><Icon name={open === index ? 'Minus' : 'Plus'} size={18} /></button>{open === index && <p>{t(answer)}</p>}</div>)}</div>
}

export function Field({ label, name, type = 'text', placeholder, required = false, ...props }) {
  return <label className="field"><span>{label}{required && <b>*</b>}</span><input name={name} type={type} placeholder={placeholder} required={required} {...props} /></label>
}

export function SelectField({ label, name, children, ...props }) {
  return <label className="field"><span>{label}</span><select name={name} {...props}>{children}</select></label>
}

export function TextareaField({ label, name, placeholder, ...props }) {
  return <label className="field"><span>{label}</span><textarea name={name} placeholder={placeholder} {...props} /></label>
}

export function EmptyState({ title = 'Здесь пока ничего нет.', text }) {
  return <div className="empty-state"><Icon name="Inbox" size={28} /><strong>{title}</strong>{text && <p>{text}</p>}</div>
}
