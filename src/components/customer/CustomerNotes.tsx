import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Trash2, Send } from 'lucide-react';

interface Note {
  id: string;
  customerId: string;
  text: string;
  createdAt: string;
  createdBy: string;
}

interface CustomerNotesProps {
  customerId: string;
}

const mockUser = 'أنت'; // في النظام الحقيقي: استخدم اسم المستخدم الحالي

const CustomerNotes = ({ customerId }: CustomerNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [adding, setAdding] = useState(false);

  // في النظام الحقيقي: استبدل هذا بجلب/حفظ من قاعدة البيانات

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAdding(true);
    setTimeout(() => {
      setNotes([
        {
          id: Date.now().toString(),
          customerId,
          text: noteText,
          createdAt: new Date().toISOString(),
          createdBy: mockUser,
        },
        ...notes,
      ]);
      setNoteText('');
      setAdding(false);
    }, 600);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
          الملاحظات والتواصل
        </CardTitle>
        <CardDescription>سجل جميع الملاحظات أو التواصل الداخلي حول العميل</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 items-end">
          <Textarea
            placeholder="اكتب ملاحظة أو رسالة..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="flex-1 resize-none"
            rows={2}
            maxLength={500}
            disabled={adding}
          />
          <Button onClick={handleAddNote} disabled={adding || !noteText.trim()} className="h-10 px-3">
            {adding ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-muted rounded-lg p-3 flex items-start gap-3 relative group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-blue-700">{note.createdBy}</span>
                    <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-sm whitespace-pre-line">{note.text}</div>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition" onClick={() => handleDeleteNote(note.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-2 opacity-50 text-blue-600" />
            <p>لا توجد ملاحظات بعد لهذا العميل</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerNotes;
