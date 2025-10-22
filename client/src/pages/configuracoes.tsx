import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Moon, Sun, Bell } from "lucide-react";

export default function Configuracoes() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e informações da conta
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
            <CardDescription>
              Detalhes do seu perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Nome</Label>
              <p className="text-base font-medium" data-testid="text-user-name">
                {user?.name}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-base font-medium" data-testid="text-user-email">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Personalize a interface do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-toggle" className="flex items-center gap-2">
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  Modo Escuro
                </Label>
                <p className="text-sm text-muted-foreground">
                  {theme === "light" ? "Desativado" : "Ativado"}
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-theme"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configurações de alertas automáticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Alertas Diários</p>
                <p className="text-xs text-muted-foreground">
                  Receba emails com editais D-1 às 08:00
                </p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">
                Em breve
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              A funcionalidade de alertas automáticos será ativada em breve.
              Por enquanto, use o botão "Enviar Alerta" no Dashboard.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
            <CardDescription>
              Informações da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-mono font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fonte de Dados</span>
              <span className="font-medium">PNCP API</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última Atualização</span>
              <span className="font-medium">Hoje</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
